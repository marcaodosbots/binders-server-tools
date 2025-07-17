const { Events } = require('discord.js');
const { getUser, setLastKnownLocale } = require('../../database/db.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const interactionErrorHandler = require('../utils/interactionErrorHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        console.log(`[DEBUG] 1. Roteador recebeu uma interação. Tipo: ${interaction.type}. Local: ${interaction.inGuild() ? 'Servidor' : 'DM'}`);
        if (interaction.user.bot) return;

        // só 'aprende' o idioma se for numa interação de servidor
        if (interaction.inGuild()) {
            const userData = getUser(interaction.user.id);
            if (userData.language === 'lang_auto') {
                setLastKnownLocale(interaction.user.id, interaction.locale);
            }
        }

        // --- Roteador para Comandos de Barra (/) ---
        if (interaction.isChatInputCommand()) {
            console.log(`[DEBUG] 2. É um comando de barra: /${interaction.commandName}`);
            const canProceed = await tosCheck(interaction);
            if (!canProceed) {
                console.log('[DEBUG] Interação barrada pelo tosCheck.');
                return;
            }

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.log(`[DEBUG] Roteador não achou o comando, chamando o handler de erro.`);
                return interactionErrorHandler.execute(interaction, new Error('Comando não encontrado'));
            }
            try {
                await command.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau no comando ${interaction.commandName}:`, error);
                return interactionErrorHandler.execute(interaction, error);
            }
            return;
        }

        // --- Roteador pra Componentes (Botão e Menu) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            console.log(`[DEBUG] 2. É um componente. ID: ${interaction.customId}`);
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            // caso especial pro botão q inicia o fluxo de ToS
            if (interaction.customId.startsWith('start_tos')) {
                console.log(`[DEBUG] Roteador identificou o botão 'start_tos'. Chamando o porteiro tosCheck...`);
                return tosCheck(interaction);
            }

            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                console.error(`handler nao encontrado pra: ${interaction.customId}`);
                return interactionErrorHandler.execute(interaction, new Error(`Handler de componente não encontrado`));
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