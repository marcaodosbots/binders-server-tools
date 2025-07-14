const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        // --- Porteiro dos Termos de Serviço ---
        // lista de IDs que fazem parte do fluxo de configuração e não devem ser checados de novo
        const bypassTosCheck = ['tos_accept', 'lang_select'];
        const isBypassInteraction = bypassTosCheck.some(id => interaction.customId?.startsWith(id));

        // se a interação NÃO for uma da lista de bypass, a gente chama o porteiro
        if (!isBypassInteraction) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; // se o porteiro barrar, para tudo aqui
        }

        // --- Roteador Principal ---
        
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Comando não encontrado: ${interaction.commandName}`);
                return handleNoCommand.execute(interaction);
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro executando o comando ${interaction.commandName}:`, error);
                // em um caso real, vc pode mandar um embed de erro aqui
            }
            return;
        }

        if (interaction.isButton()) {
            // caso especial para o botão que inicia o fluxo, ele chama o porteiro de novo
            if (interaction.customId.startsWith('start_tos')) {
                return tosCheck(interaction);
            }

            // para os outros botões, ele procura o handler especialista
            const buttonHandler = client.buttons.find(button => interaction.customId.startsWith(button.name));
            if (!buttonHandler) {
                console.error(`Handler de botão não encontrado para: ${interaction.customId}`);
                return;
            }
            
            try {
                await buttonHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no botão ${interaction.customId}:`, error);
            }
            return;
        }

        if (interaction.isStringSelectMenu()) {
            // menus não precisam de checagem de termos pq só aparecem depois de aceitar
            const selectHandler = client.selects.find(select => interaction.customId.startsWith(select.name));
            if (!selectHandler) {
                console.error(`Handler de menu não encontrado para: ${interaction.customId}`);
                return;
            }
            
            try {
                await selectHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no menu ${interaction.customId}:`, error);
            }
        }
    },
};