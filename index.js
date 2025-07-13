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

// --- carregador de interações tipo botão, menu etc ---
const interactionsPath = path.join(__dirname, 'src', 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
    const filePath = path.join(interactionsPath, file);
    const interaction = require(filePath);

    if (interaction.name === 'interactionCreate' && typeof interaction.execute === 'function') {
        client.on('interactionCreate', async (i) => {
            try {
                await interaction.execute(i, client);
            } catch (err) {
                console.error('deu ruim na interação:', err);
            }
        });
    }
}

// liga o bot
client.login(process.env.DISCORD_TOKEN);
