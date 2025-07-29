// database/db.js
const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

function createDailyBackup() {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
        console.log('[db] pasta de backups criada.');
    }
    const today = new Date().toISOString().slice(0, 10);
    const backupFilePath = path.join(backupDir, `backup-${today}.db`);
    if (!fs.existsSync(backupFilePath)) {
        db.backup(backupFilePath)
            .then(() => console.log(`[db] backup do dia ${today} feito.`))
            .catch((err) => console.error('[db] falha no backup:', err));
    }
}

function initializeDatabase() {
    console.log('[db] verificando estrutura do banco de dados...');
    createDailyBackup();

    const createTablesStmt = `
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            tosVersion INTEGER DEFAULT 0,
            language TEXT DEFAULT 'lang_auto',
            lastKnownLocale TEXT,
            badges TEXT,
            isDeveloper INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS guilds (
            guildId TEXT PRIMARY KEY,
            inGuild INTEGER DEFAULT 1,
            joinedAt INTEGER,
            permaInvite TEXT,
            antiraidEnabled INTEGER DEFAULT 0,
            antibotEnabled INTEGER DEFAULT 0,
            serverRegion TEXT,
            lastCommands TEXT,
            commandsRun INTEGER DEFAULT 0,
            interactionUsers INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS ai_history (
            messageId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
    `;
    db.exec(createTablesStmt);

    try {
        db.prepare('ALTER TABLE guilds ADD COLUMN inGuild INTEGER DEFAULT 1').run();
        console.log('[db migration] coluna "inGuild" adicionada em guilds.');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.error('[db migration] erro ao adicionar coluna em guilds:', error);
        }
    }
    console.log('[db] tabelas prontas.');
}

initializeDatabase();

const selectUser = db.prepare('SELECT * FROM users WHERE userId = ?');
const insertUser = db.prepare('INSERT INTO users (userId) VALUES (?)');
const updateUserLocale = db.prepare('UPDATE users SET lastKnownLocale = ? WHERE userId = ?');
const selectGuild = db.prepare('SELECT * FROM guilds WHERE guildId = ?');
const insertGuild = db.prepare('INSERT INTO guilds (guildId, joinedAt, serverRegion, inGuild) VALUES (?, ?, ?, 1)');

function getUser(userId) {
    let user = selectUser.get(userId);
    if (!user) {
        insertUser.run(userId);
        user = selectUser.get(userId);
    }
    return user;
}
function updateUser(userId, column, value) {
    db.prepare(`UPDATE users SET ${column} = ? WHERE userId = ?`).run(value, userId);
}
function setLastKnownLocale(userId, locale) {
    updateUserLocale.run(locale, userId);
}
function getGuild(guild) {
    let guildData = selectGuild.get(guild.id);
    if (!guildData) {
        insertGuild.run(guild.id, guild.joinedTimestamp, guild.preferredLocale);
        guildData = selectGuild.get(guild.id);
    } else if (guildData.inGuild === 0) {
        updateGuild(guild.id, 'inGuild', 1);
        guildData.inGuild = 1;
    }
    return guildData;
}
function updateGuild(guildId, column, value) {
    db.prepare(`UPDATE guilds SET ${column} = ? WHERE guildId = ?`).run(value, guildId);
}

module.exports = { db, getUser, updateUser, setLastKnownLocale, getGuild, updateGuild };