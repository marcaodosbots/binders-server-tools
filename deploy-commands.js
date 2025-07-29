const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
let subcommandCount = 0;

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath);

for (const item of commandItems) {
    const itemPath = path.join(commandsPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                const commandData = command.data.toJSON();
                commands.push(commandData);

                if (commandData.options) {
                    const subcommands = commandData.options.filter(opt => opt.type === ApplicationCommandOptionType.Subcommand);
                    subcommandCount += subcommands.length;
                }
            }
        }
    } else if (item.endsWith('.js')) {
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            const commandData = command.data.toJSON();
            commands.push(commandData);

            if (commandData.options) {
                const subcommands = commandData.options.filter(opt => opt.type === ApplicationCommandOptionType.Subcommand);
                subcommandCount += subcommands.length;
            }
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {

        console.log(`Iniciando a atualização de ${commands.length} comandos (/) e ${subcommandCount} subcomandos da aplicação.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Sucesso! ${data.length} comandos (/) foram recarregados.`);
    } catch (error) {
        console.error(error);
    }
})();