// anticrash
require('./src/utils/errorHandler.js')();

const { Client, Collection, GatewayIntentBits, Partials, ApplicationCommandOptionType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// carrega o .env pro process.env
require('dotenv').config();

// puxa e inicia a database
require('./database/db.js');

// instancia o client com os intents e partials corretos
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

// --- Carregador de Comandos (com contador de subcomandos) ---
let subcommandCount = 0;
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath);

for (const item of commandItems) {
    const itemPath = path.join(commandsPath, item);
    let commandFiles = [];

    if (fs.statSync(itemPath).isDirectory()) {
        commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js')).map(file => path.join(itemPath, file));
    } else if (item.endsWith('.js')) {
        commandFiles.push(itemPath);
    }

    for (const filePath of commandFiles) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            // se o comando tiver subcomandos, a gente conta eles
            if (command.data.options) {
                const subcommands = command.data.options.filter(opt => opt.type === ApplicationCommandOptionType.Subcommand);
                subcommandCount += subcommands.length;
            }
        }
    }
}
console.log(`[CARREGADOR] Carregados ${client.commands.size} comandos e ${subcommandCount} subcomandos.`);


// --- Carregador de Eventos ---
const eventFiles = fs.readdirSync(path.join(__dirname, 'src', 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
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
        const filePath = path.join(folderPath, file);
        const componentHandler = require(filePath);
        if (folder === 'buttons') {
            client.buttons.set(componentHandler.name, componentHandler);
        } else if (folder === 'selects') {
            client.selects.set(componentHandler.name, componentHandler);
        }
    }
}
console.log(`[CARREGADOR] Carregados ${client.buttons.size} handlers de botão.`);
console.log(`[CARREGADOR] Carregados ${client.selects.size} handlers de menu.`);


// --- Log de Status (Online/Offline) ---
const { sendLifecycleLog } = require('./src/utils/lifecycleLogger.js');
process.on('SIGINT', () => {
    sendLifecycleLog('🔴 Bot Desligando...', 'Red');
    setTimeout(() => process.exit(0), 1000); // da um tempinho pro webhook enviar antes de fechar
});


// liga o bot
client.login(process.env.DISCORD_TOKEN);