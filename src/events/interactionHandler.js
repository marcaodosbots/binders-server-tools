const { Events } = require('discord.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        // --- Roteador Principal ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                const handleNoCommand = require('./no_command.js');
                return handleNoCommand.execute(interaction);
            }
            try {
                await command.execute(interaction, client);
            } catch (error) { console.error(`Erro no comando ${interaction.commandName}:`, error); }
            return;
        }

        // para qualquer componente (botão, menu), a gente checa o dono primeiro
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // nosso super-segurança entra em ação
            const isOwner = await checkInteractionOwnership(interaction);
            // se ele barrar o curioso, a função para aqui
            if (!isOwner) return;
        }

        if (interaction.isButton()) {
            const buttonHandler = client.buttons.find(b => interaction.customId.startsWith(b.name));
            if (!buttonHandler) return console.error(`Handler de botão não encontrado: ${interaction.customId}`);
            try {
                await buttonHandler.execute(interaction, client);
            } catch (error) { console.error(`Erro no botão ${interaction.customId}:`, error); }
            return;
        }

        if (interaction.isStringSelectMenu()) {
            const selectHandler = client.selects.find(s => interaction.customId.startsWith(s.name));
            if (!selectHandler) return console.error(`Handler de menu não encontrado: ${interaction.customId}`);
            try {
                await selectHandler.execute(interaction, client);
            } catch (error) { console.error(`Erro no menu ${interaction.customId}:`, error); }
        }
    },
};