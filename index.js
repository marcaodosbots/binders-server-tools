// puxando as paradas que a gente precisa
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// carrega o .env pro process.env
require('dotenv').config();

// instancia o client, definindo os intents basicos
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- CARREGADOR DE COMANDOS ---
client.commands = new Collection();
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
            console.log(`[AVISO] o comando em ${filePath} ta zuado, faltando 'data' ou 'execute'.`);
        }
    }
}

// --- CARREGADOR DE EVENTOS (EVENT HANDLER) ---
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    // checa se o evento deve rodar só uma vez (once) ou sempre (on)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}


// liga o bot
client.login(process.env.DISCORD_TOKEN);