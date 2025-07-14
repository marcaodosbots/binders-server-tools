// puxando as paradas que a gente precisa
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// carrega o .env pro process.env
require('dotenv').config();

// puxa e inicia a database (fora da src msm)
require('./database/db.js');

// instancia o client, definindo os intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
    ] 
});

// --- carregador de comandos ---
client.commands = new Collection();
client.buttons = new Collection(); // para guardar os handlers de botão
client.selects = new Collection(); // para guardar os handlers de menu

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, folder, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[aviso] o comando em ${filePath} tá zuado, faltando 'data' ou 'execute'.`);
        }
    }
}

// --- carregador de eventos ---
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// liga o bot
client.login(process.env.DISCORD_TOKEN);

// --- CARREGADOR DE BOTÕES ---
const buttonsPath = path.join(__dirname, 'src', 'interactions', 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    // a chave vai ser o nome do arquivo (ex: 'tos_accept')
    client.buttons.set(button.name, button);
}

// --- CARREGADOR DE MENUS DE SELEÇÃO ---
const selectsPath = path.join(__dirname, 'src', 'interactions', 'selects');
const selectFiles = fs.readdirSync(selectsPath).filter(file => file.endsWith('.js'));

for (const file of selectFiles) {
    const filePath = path.join(selectsPath, file);
    const select = require(filePath);
    client.selects.set(select.name, select);
}