const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const checkInteractionOwnership = require('../utils/interactionOwnership.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        
        // --- ROTEADOR PRA COMANDO DE BARRA (/) ---
        if (interaction.isChatInputCommand()) {
            // primeiro de tudo, checa se o user ja aceitou os termos
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; 

            const command = client.commands.get(interaction.commandName);
            // se o comando n existe na nossa collection, chama o handler de erro
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

        // --- ROTEADOR PRA BOTAO E MENU ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // checa se o curioso ta clicando no botao dos outros
            const isOwner = await checkInteractionOwnership(interaction);
            if (!isOwner) return;

            // descobre se é pra procurar na gaveta de botão ou de menu
            const handlerCollection = interaction.isButton() ? client.buttons : client.selects;
            const handler = handlerCollection.find(h => interaction.customId.startsWith(h.name));
            
            // se n achou um handler de arquivo, ve se é o caso especial do start_tos
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