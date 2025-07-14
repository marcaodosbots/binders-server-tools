// database/db.js

const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

// --- CRIAÇÃO E CONEXÃO COM O DB ---
const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath); // não precisa do verbose no dia a dia

// --- SISTEMA DE BACKUP ---
function createDailyBackup() {
    const backupDir = path.join(__dirname, 'backups');

    // se a pasta de backups n existir, cria ela
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
        console.log('[Backup] Pasta de backups criada.');
    }

    // pega a data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    const backupFilePath = path.join(backupDir, `backup-${today}.db`);

    // checa se o backup de hoje já foi feito
    if (!fs.existsSync(backupFilePath)) {
        // copia o arquivo do db principal para o arquivo de backup
        db.backup(backupFilePath)
            .then(() => console.log(`[Backup] Backup do dia ${today} criado com sucesso.`))
            .catch((err) => console.error('[Backup] Falha ao criar backup:', err));
    } else {
        // essa msg n precisa aparecer toda hora, só se quiser debugar
        // console.log(`[Backup] O backup de hoje (${today}) já existe.`);
    }
}

// --- INICIALIZAÇÃO DAS TABELAS ---
function initializeDatabase() {
    console.log('[Database] Iniciando a verificação do banco de dados...');
    createDailyBackup(); // roda a função de backup toda vez q o bot liga

    // Usamos .exec() pra rodar múltiplos comandos de uma vez
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

    console.log('[Database] Estrutura de tabelas verificada e pronta.');
}

// Já chama a função principal pra preparar tudo
initializeDatabase();

// --- FUNÇÕES GERENTES ---

// função pra pegar um usuário do db. se ele n existir, a gente cria um registro padrão pra ele.
function getUser(userId) {
    let user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    if (!user) {
        db.prepare('INSERT INTO users (userId) VALUES (?)').run(userId);
        user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    }
    return user;
}

// função pra atualizar os dados de um usuário
function updateUser(userId, column, value) {
    // a gente usa 'run' pra comandos que não retornam dados (INSERT, UPDATE, DELETE)
    db.prepare(`UPDATE users SET ${column} = ? WHERE userId = ?`).run(value, userId);
}

// a gente exporta as funções junto com a conexão principal
module.exports = { db, getUser, updateUser };