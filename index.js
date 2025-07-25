//anti crash
require('./src/utils/errorHandler.js')();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// carrega o .env pro process.env
require('dotenv').config();

// puxa e inicia a database 
require('./database/db.js');

// intent e coisa o client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages, // <-- O INTENT QUE FALTAVA PRA OUVIR DMS
    ],
    partials: [
        Partials.Channel, // <-- ISSO AQUI VAI FAZER A DM FUNCIONAR DE VEZ
    ]
});

// --- carregadores ---
client.commands = new Collection();
client.buttons = new Collection();
client.selects = new Collection();

// --- carregador de comandos ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath); // pega tudo

for (const item of commandItems) {
    const itemPath = path.join(commandsPath, item);
    // checa se o item é uma pasta
    if (fs.statSync(itemPath).isDirectory()) {
        // se for uma pasta, lê os arquivos de comando dentro dela
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
        }
    } else if (item.endsWith('.js')) {
        // se for um arquivo .js solto, carrega ele diretamente
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}
// a linha de log de quantos comandos foram carregados vem depois do loop
console.log(`[CARREGADOR] Carregados ${client.commands.size} comandos.`);

// carregador de eventos
const eventFiles = fs.readdirSync(path.join(__dirname, 'src', 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// carregador de botões
const buttonFiles = fs.readdirSync(path.join(__dirname, 'src', 'interactions', 'buttons')).filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
    const button = require(`./src/interactions/buttons/${file}`);
    client.buttons.set(button.name, button);
}
console.log(`[CARREGADOR] Carregados ${client.buttons.size} handlers de botão.`);

// carregador de menus de seleção
const selectFiles = fs.readdirSync(path.join(__dirname, 'src', 'interactions', 'selects')).filter(file => file.endsWith('.js'));
for (const file of selectFiles) {
    const select = require(`./src/interactions/selects/${file}`);
    client.selects.set(select.name, select);
}
console.log(`[CARREGADOR] Carregados ${client.selects.size} handlers de menu.`);

// liga o bot
client.login(process.env.DISCORD_TOKEN);

const { sendLifecycleLog } = require('./src/utils/lifecycleLogger.js');

process.on('SIGINT', () => {
    sendLifecycleLog('🔴 Bot Desligando...', 'Red');
    // da um tempinho pro webhook enviar antes de fechar
    setTimeout(() => process.exit(0), 1000);
});