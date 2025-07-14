// database/db.js

const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

// --- conexão com o db ---
const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

// --- statements preparados ---
// pra n ficar preparando a mesma query toda hora, a gente prepara uma vez só aqui.
// fica bem mais rapido.
const selectUser = db.prepare('SELECT * FROM users WHERE userId = ?');
const insertUser = db.prepare('INSERT INTO users (userId) VALUES (?)');


function createDailyBackup() {
    const backupDir = path.join(__dirname, 'backups');

    // cria a pasta de backup se n existir
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
        console.log('[db] pasta de backups criada.');
    }

    const today = new Date().toISOString().slice(0, 10);
    const backupFilePath = path.join(backupDir, `backup-${today}.db`);

    // só faz o backup se o de hoje ainda n foi feito
    if (!fs.existsSync(backupFilePath)) {
        db.backup(backupFilePath)
            .then(() => console.log(`[db] backup do dia ${today} feito.`))
            .catch((err) => console.error('[db] falha no backup:', err));
    }
}

function initializeDatabase() {
    console.log('[db] verificando estrutura do banco de dados...');
    createDailyBackup();

    // cria as tabelas se elas n existirem. o .exec roda tudo de uma vez
    const createTablesStmt = `
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            tosVersion INTEGER DEFAULT 0,
            language TEXT DEFAULT 'lang_auto',
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

// prepara o db assim que o bot liga
initializeDatabase();


// --- funções 'gerente' ---

// pego o user. se n achar, crio um registro novo pra ele com os defaults da tabela.
function getUser(userId) {
    let user = selectUser.get(userId);
    if (!user) {
        insertUser.run(userId);
        user = selectUser.get(userId);
    }
    return user;
}

// função genérica pra dar update na coluna de um user.
function updateUser(userId, column, value) {
    // aqui tem q preparar toda vez pq o nome da coluna é dinamico.
    db.prepare(`UPDATE users SET ${column} = ? WHERE userId = ?`).run(value, userId);
}


module.exports = { db, getUser, updateUser };