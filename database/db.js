const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

function initializeAndMigrateDatabase() {
    console.log('[db] verificando estrutura e aplicando migrações...');
    
    db.exec(`CREATE TABLE IF NOT EXISTS users (userId TEXT PRIMARY KEY, tosVersion INTEGER DEFAULT 0, language TEXT DEFAULT 'lang_auto', lastKnownLocale TEXT, badges TEXT, isDeveloper INTEGER DEFAULT 0);`);
    db.exec(`CREATE TABLE IF NOT EXISTS guilds (guildId TEXT PRIMARY KEY, joinedAt INTEGER, permaInvite TEXT, antiraidEnabled INTEGER DEFAULT 0, antibotEnabled INTEGER DEFAULT 0, serverRegion TEXT, commandsRun INTEGER DEFAULT 0, interactionUsers INTEGER DEFAULT 0);`);
    db.exec('CREATE TABLE IF NOT EXISTS analytics (key TEXT PRIMARY KEY, value TEXT)');
    db.exec(`CREATE TABLE IF NOT EXISTS guild_interactions (guildId TEXT NOT NULL, userId TEXT NOT NULL, PRIMARY KEY (guildId, userId))`);
    db.prepare('DROP TABLE IF EXISTS ai_history').run();
    db.prepare('DROP TABLE IF EXISTS db_meta').run();

    db.transaction(() => {
        const userColumns = {
            firstInteraction: 'INTEGER', lastInteraction: 'INTEGER', commandCount: 'INTEGER DEFAULT 0',
            interactionCount: 'INTEGER DEFAULT 0', last10Commands: 'TEXT', timezone: 'TEXT',
            bannedUntil: 'INTEGER', canBeDMed: 'INTEGER DEFAULT 1', voteCount: 'INTEGER DEFAULT 0',
            profileColor: 'TEXT', streak: 'INTEGER DEFAULT 0'
        };
        const guildColumns = {
            inGuild: 'INTEGER DEFAULT 1', streak: 'INTEGER DEFAULT 0',
            lastInteractions: 'TEXT', interactionsRun: 'INTEGER DEFAULT 0', lastCommands: 'TEXT'
        };

        for (const [column, type] of Object.entries(userColumns)) {
            try { db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${type}`).run(); } 
            catch (e) { if (!e.message.includes('duplicate column')) throw e; }
        }
        for (const [column, type] of Object.entries(guildColumns)) {
            try { db.prepare(`ALTER TABLE guilds ADD COLUMN ${column} ${type}`).run(); } 
            catch (e) { if (!e.message.includes('duplicate column')) throw e; }
        }
    })();
    console.log('[db] tabelas prontas.');
    createDailyBackup();
}

initializeAndMigrateDatabase();

const selectUser = db.prepare('SELECT * FROM users WHERE userId = ?');
const insertUser = db.prepare('INSERT INTO users (userId) VALUES (?)');
const updateUserLocale = db.prepare('UPDATE users SET lastKnownLocale = ? WHERE userId = ?');
const selectGuild = db.prepare('SELECT * FROM guilds WHERE guildId = ?');
const insertGuild = db.prepare('INSERT INTO guilds (guildId, joinedAt, serverRegion) VALUES (?, ?, ?)');
const getAnalyticsValue = db.prepare('SELECT value FROM analytics WHERE key = ?');
const setAnalyticsValue = db.prepare('INSERT OR REPLACE INTO analytics (key, value) VALUES (?, ?)');
const findGuildInteraction = db.prepare('SELECT 1 FROM guild_interactions WHERE guildId = ? AND userId = ?');
const insertGuildInteraction = db.prepare('INSERT INTO guild_interactions (guildId, userId) VALUES (?, ?)');

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
function getGuild(guild, context = 'other') {
    let guildData = selectGuild.get(guild.id);
    if (!guildData) {
        insertGuild.run(guild.id, guild.joinedTimestamp, guild.preferredLocale);
        guildData = selectGuild.get(guild.id);
    } else if (guildData.inGuild === 0 && context === 'guildCreate') {
        updateGuild(guild.id, 'inGuild', 1);
        guildData.inGuild = 1;
    }
    return guildData;
}
function updateGuild(guildId, column, value) {
    db.prepare(`UPDATE guilds SET ${column} = ? WHERE guildId = ?`).run(value, guildId);
}

function createDailyBackup() {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const today = new Date().toISOString().slice(0, 10);
    const backupFilePath = path.join(backupDir, `backup-${today}.db`);
    if (!fs.existsSync(backupFilePath)) {
        db.backup(backupFilePath)
            .then(() => console.log(`[db] backup do dia ${today} feito.`))
            .catch((err) => console.error('[db] falha no backup:', err));
    }
}

// AQUI A CORREÇÃO: adicionamos a função que estava faltando
module.exports = { db, getUser, updateUser, setLastKnownLocale, getGuild, updateGuild, getAnalyticsValue, setAnalyticsValue, findGuildInteraction, insertGuildInteraction };