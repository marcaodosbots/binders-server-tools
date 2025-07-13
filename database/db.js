// database/db.js

const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

// --- CRIAÇÃO E CONEXÃO COM O DB ---
const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath, { /* verbose: console.log */ });

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
        console.log(`[Backup] O backup de hoje (${today}) já existe.`);
    }
}

// --- INICIALIZAÇÃO DAS TABELAS ---
function initializeDatabase() {
    console.log('[Database] Iniciando a verificação do banco de dados...');
    createDailyBackup(); // roda a função de backup toda vez q o bot liga

    // cria a tabela de USUÁRIOS com as novas colunas
    const createUserTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            tosVersion INTEGER DEFAULT 0,
            language TEXT DEFAULT 'pt_BR',
            badges TEXT,
            isDeveloper INTEGER DEFAULT 0
        )
    `);

    // cria a tabela de SERVIDORES
    const createGuildsTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS guilds (
            guildId TEXT PRIMARY KEY,
            antiraidEnabled INTEGER DEFAULT 0,
            welcomeChannelId TEXT,
            goodbyeChannelId TEXT
        )
    `);

    // cria a tabela para o HISTÓRICO DA IA
    const createAiHistoryTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS ai_history (
            messageId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )
    `);

    // roda os comandos para criar as tabelas
    db.transaction(() => {
        createUserTable.run();
        createGuildsTable.run();
        createAiHistoryTable.run();
    })();

    console.log('[Database] Estrutura de tabelas verificada e pronta.');
}

// já chama a função principal pra preparar tudo
initializeDatabase();

// exporta a conexão para ser usada em outros lugares
module.exports = db;