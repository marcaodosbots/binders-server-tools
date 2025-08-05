// database/db.js
const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

// --- sistema de migração ---
// a gente sobe esse número toda vez q fizer uma mudança na estrutura do db
const DB_VERSION = 1;

function runMigrations() {
    console.log('[db] verificando a necessidade de migrações...');
    
    db.exec('CREATE TABLE IF NOT EXISTS db_meta (key TEXT PRIMARY KEY, value INTEGER)');
    let currentVersion = db.prepare('SELECT value FROM db_meta WHERE key = ?').get('version')?.value || 0;

    if (currentVersion >= DB_VERSION) {
        console.log('[db] seu banco de dados já está na versão mais recente.');
        return;
    }

    console.log(`[db] versão atual: ${currentVersion}. versão alvo: ${DB_VERSION}. iniciando migração...`);

    // --- lista de todas as migrações ---
    if (currentVersion < 1) {
        try {
            console.log('[db migration v1] iniciando reforma da tabela users e remoção de ai_history...');
            db.prepare('DROP TABLE IF EXISTS ai_history').run();
            // adiciona cada coluna nova de forma segura. se já existir, ele ignora o erro.
            db.prepare('ALTER TABLE users ADD COLUMN firstInteraction INTEGER').run();
            db.prepare('ALTER TABLE users ADD COLUMN lastInteraction INTEGER').run();
            db.prepare('ALTER TABLE users ADD COLUMN commandCount INTEGER DEFAULT 0').run();
            db.prepare('ALTER TABLE users ADD COLUMN interactionCount INTEGER DEFAULT 0').run();
            db.prepare('ALTER TABLE users ADD COLUMN last10Commands TEXT').run();
            db.prepare('ALTER TABLE users ADD COLUMN timezone TEXT').run();
            db.prepare('ALTER TABLE users ADD COLUMN bannedUntil INTEGER').run();
            db.prepare('ALTER TABLE users ADD COLUMN canBeDMed INTEGER DEFAULT 1').run();
            db.prepare('ALTER TABLE users ADD COLUMN voteCount INTEGER DEFAULT 0').run();
            db.prepare('ALTER TABLE users ADD COLUMN profileColor TEXT').run();
            console.log('[db migration v1] tabelas reformadas com sucesso.');
        } catch (e) {
            // a gente só ignora o erro se for de 'coluna duplicada', q é esperado
            if (!e.message.includes('duplicate column name')) {
                console.error('[db migration v1] falha na reforma:', e);
                process.exit(1); // para o bot pra não corromper nada
            }
        }
    }

    // atualiza a versão do db no final de tudo
    db.prepare('INSERT OR REPLACE INTO db_meta (key, value) VALUES (?, ?)').run('version', DB_VERSION);
    console.log('[db] migrações concluídas com sucesso.');
}


function initializeDatabase() {
    console.log('[db] verificando estrutura do banco de dados...');
    
    // a gente apaga a guilds pra recriar com a estrutura nova, como vc pediu
    db.prepare('DROP TABLE IF EXISTS guilds').run();

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
    `;
    db.exec(createTablesStmt);
    
    // chama a função de reforma
    runMigrations();
    
    console.log('[db] tabelas prontas.');
    createDailyBackup();
}

initializeDatabase();


// --- statements preparados ---
const selectUser = db.prepare('SELECT * FROM users WHERE userId = ?');
const insertUser = db.prepare('INSERT INTO users (userId) VALUES (?)');
const updateUserLocale = db.prepare('UPDATE users SET lastKnownLocale = ? WHERE userId = ?');
const selectGuild = db.prepare('SELECT * FROM guilds WHERE guildId = ?');
const insertGuild = db.prepare('INSERT INTO guilds (guildId, joinedAt, serverRegion) VALUES (?, ?, ?)');


// --- funções 'gerente' ---
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
// a função de backup fica aqui no final pra manter a organização
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

module.exports = { db, getUser, updateUser, setLastKnownLocale, getGuild, updateGuild };