const { Events } = require('discord.js');
const { getUser, setLastKnownLocale } = require('../../database/db.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        if (!interaction.inGuild() || interaction.user.bot) return;

        // ---- lógica de aprendizado de idioma ----
        // a primeira coisa q o bot faz é aprender o idioma da interação
        // pra usar na proxima menção, caso a config do user seja 'auto'
        const userData = getUser(interaction.user.id);
        if (userData.language === 'lang_auto') {
            setLastKnownLocale(interaction.user.id, interaction.locale);
        }

        // ---- Roteador de Comandos de Barra (/) ----
        if (interaction.isChatInputCommand()) {
            // porteiro sempre checa os termos pra comandos
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return handleNoCommand.execute(interaction);
            }

            try {
                await command.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        // --- Roteador pra Componentes (Botão e Menu) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // super-segurança sempre checa se o curioso ta clicando no q n deve
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            // agora a gente descobre qual o handler certo pra chamar
            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            if (!handler) {
                // caso especial pro botão q inicia o fluxo de ToS
                if (interaction.customId.startsWith('start_tos')) {
                    return tosCheck(interaction);
                }
                return console.error(`handler nao encontrado pra: ${interaction.customId}`);
            }

            // porteiro dos termos também age para botões públicos (como o de ajuda)
            // botões do fluxo de ToS (accept, lang_select) não precisam dessa checagem
            if (handler.name === 'show_help_menu') {
                const canProceed = await tosCheck(interaction);
                if (!canProceed) return;
            }
            
            try {
                await handler.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau na interação ${interaction.customId}:`, error); 
            }
        }
    },
};