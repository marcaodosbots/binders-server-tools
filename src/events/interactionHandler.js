const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        // --- Roteador para Comandos de Barra (/) ---
        if (interaction.isChatInputCommand()) {
            // A verificação de dono NÃO acontece aqui. Só a de termos.
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return handleNoCommand.execute(interaction);
            }
            try {
                await command.execute(interaction, client);
            } catch (error) { console.error(`Erro no comando ${interaction.commandName}:`, error); }
            return;
        }

        // --- Roteador para Botões e Menus ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // A verificação de dono SÓ acontece para componentes.
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return; // Se o segurança barrar o curioso, para aqui.

            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                if (interaction.customId.startsWith('start_tos')) {
                    return tosCheck(interaction);
                }
                return console.error(`Handler não encontrado para: ${interaction.customId}`);
            }
            try {
                await handler.execute(interaction, client);
            } catch (error) { console.error(`Erro na interação ${interaction.customId}:`, error); }
        }
    },
};