//so nodar isso quando tiver um comando novo
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath);

for (const item of commandItems) {
    const itemPath = path.join(commandsPath, item);

    // se o item é uma pasta de categoria
    if (fs.statSync(itemPath).isDirectory()) {
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[AVISO] o comando em ${filePath} tá zuado.`);
            }
        }
    } else if (item.endsWith('.js')) {
        // se for um arquivo de comando solto
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[AVISO] o comando em ${itemPath} tá zuado.`);
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Iniciando a atualização de ${commands.length} comandos (/) da aplicação.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Sucesso! ${data.length} comandos (/) foram recarregados.`);
    } catch (error) {
        console.error(error);
    }
})();