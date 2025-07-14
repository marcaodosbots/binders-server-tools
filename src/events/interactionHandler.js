const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        // o porteiro continua aqui, checando tudo antes de mais nada
        // a gente ignora a checagem se o clique for em um dos nossos botões/menus internos
        const bypassIds = ['tos_accept', 'lang_select'];
        if (!bypassIds.some(id => interaction.customId?.startsWith(id))) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return;
        }

        // Roteador de Comandos de Barra
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        // Roteador de Botões
        if (interaction.isButton()) {
            // encontra o especialista cujo nome começa com o customId do botão
            const buttonHandler = client.buttons.find(button => interaction.customId.startsWith(button.name));
            if (!buttonHandler) return;
            try {
                await buttonHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no botão ${interaction.customId}:`, error);
            }
            return;
        }

        // Roteador de Menus de Seleção
        if (interaction.isStringSelectMenu()) {
            const selectHandler = client.selects.find(select => interaction.customId.startsWith(select.name));
            if (!selectHandler) return;
            try {
                await selectHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no menu ${interaction.customId}:`, error);
            }
        }
    },
};