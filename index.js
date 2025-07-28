// anticrash
require('./src/utils/errorHandler.js')();

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
require('./database/db.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [ Partials.Channel ]
});

// --- Carregadores ---
client.commands = new Collection();
client.buttons = new Collection();
client.selects = new Collection();

// --- Carregador de Comandos (Corrigido para aceitar arquivos e pastas) ---
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath); // Pega todos os itens

for (const item of commandItems) {
    const itemPath = path.join(commandsPath, item);
    
    // se o item for um arquivo .js solto, carrega ele
    if (item.endsWith('.js')) {
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        continue; // vai para o próximo item
    }

    // se for uma pasta, lê os arquivos de comando dentro dela
    if (fs.statSync(itemPath).isDirectory()) {
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
        }
    }
}
console.log(`[CARREGADOR] Carregados ${client.commands.size} comandos.`);


// --- Carregador de Eventos ---
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- Carregador de Componentes (Botões e Menus) ---
const interactionsPath = path.join(__dirname, 'src', 'interactions');
const interactionFolders = fs.readdirSync(interactionsPath);
for (const folder of interactionFolders) {
    const folderPath = path.join(interactionsPath, folder);
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const componentHandler = require(path.join(folderPath, file));
        if (folder === 'buttons') {
            client.buttons.set(componentHandler.name, componentHandler);
        } else if (folder === 'selects') {
            client.selects.set(componentHandler.name, componentHandler);
        }
    }
}
console.log(`[CARREGADOR] Carregados ${client.buttons.size} handlers de botão.`);
console.log(`[CARREGADOR] Carregados ${client.selects.size} handlers de menu.`);


// --- Log de Status e Login ---
const { sendLifecycleLog } = require('./src/utils/lifecycleLogger.js');
process.on('SIGINT', () => {
    sendLifecycleLog('🔴 Bot Desligando...', 'Red');
    setTimeout(() => process.exit(0), 1000);
});

client.login(process.env.DISCORD_TOKEN);