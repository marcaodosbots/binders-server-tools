const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        const bypassTosCheck = ['tos_accept', 'lang_select'];
        const isBypassInteraction = bypassTosCheck.some(id => interaction.customId?.startsWith(id));

        // se a interação NÃO for uma da lista de bypass, a gente chama o porteiro
        // o botão 'start_tos' também não está na lista, então ele vai ser checado aqui, o que está certo.
        if (!isBypassInteraction) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return;
        }

        // --- Roteador Principal ---
        
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return console.error(`Comando não encontrado: ${interaction.commandName}`);
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        if (interaction.isButton()) {
            // AQUI A CORREÇÃO: Caso especial para o botão que inicia o fluxo
            if (interaction.customId.startsWith('start_tos')) {
                // A ação desse botão é simplesmente chamar o 'porteiro' de novo, mas dessa vez
                // o porteiro vai mostrar a tela completa porque o usuário já interagiu.
                return tosCheck(interaction);
            }

            // Para todos os outros botões (tos_accept, show_help_menu), ele procura o handler.
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