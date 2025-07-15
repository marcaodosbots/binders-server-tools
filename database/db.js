const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

// --- conexão com o db ---
const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

// --- statements preparados ---
const selectUser = db.prepare('SELECT * FROM users WHERE userId = ?');
const insertUser = db.prepare('INSERT INTO users (userId) VALUES (?)');
const updateUserLocale = db.prepare('UPDATE users SET lastKnownLocale = ? WHERE userId = ?');

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
            antiraidEnabled INTEGER DEFAULT 0,
            welcomeChannelId TEXT,
            goodbyeChannelId TEXT
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
    console.log('[db] tabelas prontas.');
}

initializeDatabase();

// --- funções de update etc---
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

module.exports = { db, getUser, updateUser, setLastKnownLocale };