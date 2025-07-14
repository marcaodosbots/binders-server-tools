const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        if (interaction.isChatInputCommand()) {
            // 1º - O PORTEIRO CHECA OS TERMOS, SEMPRE.
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; // Se o porteiro barrar, para tudo aqui.

            // 2º - SE PASSOU, A GENTE PROCURA O COMANDO.
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                // 3º - SE O COMANDO NÃO EXISTE, A GENTE CHAMA O AJUDANTE.
                console.error(`Comando não encontrado: ${interaction.commandName}`);
                return handleNoCommand.execute(interaction);
            }

            // 4º - SE O COMANDO EXISTE, A GENTE EXECUTA.
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('start_tos')) {
                return tosCheck(interaction);
            }
            
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return;

            const buttonHandler = client.buttons.find(button => interaction.customId.startsWith(button.name));
            if (!buttonHandler) return console.error(`Handler de botão não encontrado para: ${interaction.customId}`);
            
            try {
                await buttonHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no botão ${interaction.customId}:`, error);
            }
            return;
        }

        if (interaction.isStringSelectMenu()) {
            const selectHandler = client.selects.find(select => interaction.customId.startsWith(select.name));
            if (!selectHandler) return console.error(`Handler de menu não encontrado para: ${interaction.customId}`);
            try {
                await selectHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no menu ${interaction.customId}:`, error);
            }
        }
    },
};