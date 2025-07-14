// database/db.js
const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

function initializeDatabase() {
    // ... (a função initializeDatabase continua a mesma que antes, com backup e create tables) ...
    console.log('[Database] Iniciando a verificação do banco de dados...');
    // ... (código do backup aqui) ...
    const createTablesStmt = `
        CREATE TABLE IF NOT EXISTS users (userId TEXT PRIMARY KEY, tosVersion INTEGER DEFAULT 0, language TEXT DEFAULT 'pt_BR', badges TEXT, isDeveloper INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS guilds (guildId TEXT PRIMARY KEY, antiraidEnabled INTEGER DEFAULT 0, welcomeChannelId TEXT, goodbyeChannelId TEXT);
        CREATE TABLE IF NOT EXISTS ai_history (messageId TEXT PRIMARY KEY, userId TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, timestamp INTEGER NOT NULL);
    `;
    db.exec(createTablesStmt);
    console.log('[Database] Estrutura de tabelas verificada e pronta.');
}
initializeDatabase();

// --- NOVAS FUNÇÕES GERENTES ---

// função pra pegar um usuário do db. se ele n existir, a gente cria um registro padrão pra ele.
function getUser(userId) {
    let user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    if (!user) {
        // se o usuário não está no db, insere ele com os valores padrão
        db.prepare('INSERT INTO users (userId) VALUES (?)').run(userId);
        user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    }
    return user;
}

// função pra atualizar os dados de um usuário
function updateUser(userId, column, value) {
    db.prepare(`UPDATE users SET ${column} = ? WHERE userId = ?`).run(value, userId);
}

// a gente exporta as funções junto com a conexão principal
module.exports = { db, getUser, updateUser };