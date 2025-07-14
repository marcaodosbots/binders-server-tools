const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        // --- Roteador Principal ---
        if (interaction.isChatInputCommand()) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

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

        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                // Caso especial: o botão 'start_tos' não tem um handler de arquivo, ele chama o tosCheck
                if (interaction.customId.startsWith('start_tos')) {
                    return tosCheck(interaction);
                }
                return console.error(`Handler não encontrado para: ${interaction.customId}`);
            }

            try {
                await handler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro na interação ${interaction.customId}:`, error);
            }
        }
    },
};