const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

// --- conexão com o db ---
const dbPath = path.join(__dirname, 'main.db');
const db = new Database(dbPath);

// --- sistema de migração ---
// a gente sobe esse número toda vez q fizer uma mudança grande na estrutura do db
const DB_VERSION = 2;

function runMigrations() {
    console.log('[db] verificando necessidade de migrações...');
    
    db.exec('CREATE TABLE IF NOT EXISTS db_meta (key TEXT PRIMARY KEY, value INTEGER)');
    let currentVersion = db.prepare('SELECT value FROM db_meta WHERE key = ?').get('version')?.value || 0;

    if (currentVersion >= DB_VERSION) {
        console.log('[db] o banco de dados já está na versão mais recente.');
        return;
    }

    console.log(`[db] versão atual: ${currentVersion}. versão alvo: ${DB_VERSION}. iniciando migração...`);

    db.transaction(() => {
        // --- lista de todas as migrações ---
        // cada 'if' é uma nova versão da 'reforma' do db
        
        if (currentVersion < 1) {
            // v1: adiciona a coluna 'inGuild' em guilds
            try {
                db.prepare('ALTER TABLE guilds ADD COLUMN inGuild INTEGER DEFAULT 1').run();
                console.log('[db migration v1] coluna "inGuild" adicionada em guilds.');
            } catch (e) { if (!e.message.includes('duplicate column')) throw e; }
        }

        if (currentVersion < 2) {
            // v2: reforma da tabela 'users' e remoção de 'ai_history'
            try {
                db.prepare('DROP TABLE IF EXISTS ai_history').run();
                const userColumns = [
                    'firstInteraction INTEGER', 'lastInteraction INTEGER', 'commandCount INTEGER DEFAULT 0',
                    'interactionCount INTEGER DEFAULT 0', 'last10Commands TEXT', 'timezone TEXT',
                    'bannedUntil INTEGER', 'canBeDMed INTEGER DEFAULT 1', 'voteCount INTEGER DEFAULT 0', 'profileColor TEXT'
                ];
                for (const column of userColumns) {
                    db.prepare(`ALTER TABLE users ADD COLUMN ${column}`).run();
                }
                console.log('[db migration v2] tabela "users" reformada e "ai_history" removida.');
            } catch (e) {
                if (!e.message.includes('duplicate column name')) {
                    console.error('[db migration v2] falha critica na reforma:', e);
                    process.exit(1); // para o bot pra não corromper nada
                }
            }
        }

        // atualiza a versão do db no final de tudo
        db.prepare('INSERT OR REPLACE INTO db_meta (key, value) VALUES (?, ?)').run('version', DB_VERSION);
    })();
    
    console.log('[db] migrações concluídas com sucesso.');
}

function initializeDatabase() {
    console.log('[db] verificando estrutura do banco de dados...');

    // primeiro, a gente garante que as tabelas existem com uma estrutura MÍNIMA
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
    
    // depois, a gente chama a função de reforma pra adicionar as colunas que faltam
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