const { Events } = require('discord.js');
const { getUser, setLastKnownLocale } = require('../../database/db.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const interactionErrorHandler = require('../utils/interactionErrorHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        // ignora interações de bots
        if (interaction.user.bot) return;

        // se a interação for num servidor, a gente 'aprende' o idioma do usuário
        if (interaction.inGuild()) {
            const userData = getUser(interaction.user.id);
            if (userData.language === 'lang_auto') {
                setLastKnownLocale(interaction.user.id, interaction.locale);
            }
        }

        // --- roteador de comandos de barra (/) ---
        if (interaction.isChatInputCommand()) {
            // porteiro sempre checa os termos para comandos
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interactionErrorHandler.execute(interaction, new Error(`Comando de barra não encontrado: /${interaction.commandName}`));
            }

            try {
                await command.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau no comando ${interaction.commandName}:`, error);
                return interactionErrorHandler.execute(interaction, error);
            }
            return;
        }

        // --- roteador pra componentes (botão e menu) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // segurança pra não deixar curioso clicar onde não deve
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            // caso especial pro botão que inicia o fluxo de ToS
            if (interaction.customId.startsWith('start_tos')) {
                return tosCheck(interaction);
            }

            // descobre se é pra procurar na gaveta de botão ou de menu
            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                console.error(`handler nao encontrado pra: ${interaction.customId}`);
                return interactionErrorHandler.execute(interaction, new Error(`Handler de componente não encontrado: ${interaction.customId}`));
            }
            
            try {
                await handler.execute(interaction, client);
            } catch (error) { 
                console.error(`ruim na interação ${interaction.customId}:`, error); 
                return interactionErrorHandler.execute(interaction, error);
            }
        }
    },
};