const { Events } = require('discord.js');
const { getUser, setLastKnownLocale } = require('../../database/db.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const interactionErrorHandler = require('../utils/interactionErrorHandler.js');
const devCommandHandler = require('../utils/devCommandHandler.js');
const { logInteraction } = require('../utils/interactionLogger.js');
const { trackInteraction } = require('../utils/analyticsHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    
    async execute(interaction, client) {
        if (interaction.user.bot) return;

        try {
            await logInteraction(interaction);
            await trackInteraction(interaction);
        } catch (error) {
            console.error('[FATAL] Erro nos handlers de log/analytics:', error);
        }
        
        if (interaction.inGuild()) {
            const userData = getUser(interaction.user.id);
            if (userData.language === 'lang_auto') {
                setLastKnownLocale(interaction.user.id, interaction.locale);
            }
        }

        if (interaction.isChatInputCommand()) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interactionErrorHandler.execute(interaction, new Error(`Comando não encontrado: /${interaction.commandName}`));
            }

            if (command.inDevelopment) {
                return devCommandHandler.execute(interaction);
            }

            try {
                await command.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau no comando ${interaction.commandName}:`, error);
                return interactionErrorHandler.execute(interaction, error);
            }
            return;
        }

        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            if (interaction.customId.startsWith('start_tos')) {
                return tosCheck(interaction);
            }

            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                return interactionErrorHandler.execute(interaction, new Error(`Handler de componente não encontrado: ${interaction.customId}`));
            }
            
            try {
                await handler.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau na interação ${interaction.customId}:`, error); 
                return interactionErrorHandler.execute(interaction, error);
            }
        }
    },
};