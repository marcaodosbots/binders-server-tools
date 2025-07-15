const { Events } = require('discord.js');
const { getUser, setLastKnownLocale } = require('../../database/db.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        // ignora dm e bot, o basico
        if (!interaction.inGuild() || interaction.user.bot) return;

        // aprende o idioma do user se a config dele for 'auto'
        const userData = getUser(interaction.user.id);
        if (userData.language === 'lang_auto') {
            setLastKnownLocale(interaction.user.id, interaction.locale);
        }

        // --- porteiro principal (tos) ---
        // lista de interações q fazem parte do proprio fluxo de tos e n devem ser checadas de novo
        const bypassTosCheck = ['start_tos', 'tos_accept', 'lang_select'];
        
        // se a interação NÃO for uma da lista de bypass, a gente chama o gate
        if (!bypassTosCheck.some(id => interaction.customId?.startsWith(id))) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; // se o gate barrar, para tudo aqui
        }

        // --- roteador de comandos de barra (/) ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return handleNoCommand.execute(interaction);

            try {
                await command.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        // --- roteador pra componentes (botão e menu) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // segurança pra n deixar curioso clicar onde n deve
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            // descobre se é pra procurar botão ou menu
            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            // caso especial pro botão q inicia o fluxo de ToS (não tem arquivo especialista)
            if (!handler) {
                if (interaction.customId.startsWith('start_tos')) {
                    return tosCheck(interaction);
                }
                return console.error(`handler nao encontrado pra: ${interaction.customId}`);
            }

            // se achou o handler, executa ele
            try {
                await handler.execute(interaction, client);
            } catch (error) { 
                console.error(`deu pau na interação ${interaction.customId}:`, error); 
            }
        }
    },
};