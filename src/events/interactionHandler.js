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
            // 1. O porteiro checa os termos sempre
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return;

            // 2. Se passou, procura e executa o comando
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return handleNoCommand.execute(interaction);
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no comando ${interaction.commandName}:`, error);
            }
            return;
        }

        // --- Roteador para Botões ---
        if (interaction.isButton()) {
            // Primeiro, tratamos o caso especial do botão que INICIA o fluxo de termos
            if (interaction.customId.startsWith('start_tos')) {
                // Checa se o usuário que clicou é o dono do botão
                const isOwner = await checkInteractionOwnership(interaction);
                // Se não for, nosso segurança já respondeu e a gente para tudo.
                if (!isOwner) return;

                // Se for o dono, a gente chama o porteiro pra mostrar a tela de aceite.
                return tosCheck(interaction);
            }

            // Para todos os outros botões (aceitar termos, ver ajuda, etc.),
            // a gente busca o handler especialista correspondente.
            const buttonHandler = client.buttons.find(b => interaction.customId.startsWith(b.name));
            if (!buttonHandler) {
                return console.error(`[ERRO NO ROTEADOR] Handler de botão não encontrado para o ID: ${interaction.customId}`);
            }
            try {
                // A checagem de dono para esses botões já está dentro de cada arquivo deles.
                await buttonHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no botão ${interaction.customId}:`, error);
            }
            return;
        }

        // --- Roteador para Menus de Seleção ---
        if (interaction.isStringSelectMenu()) {
            const selectHandler = client.selects.find(s => interaction.customId.startsWith(s.name));
            if (!selectHandler) {
                return console.error(`[ERRO NO ROTEADOR] Handler de menu não encontrado para: ${interaction.customId}`);
            }
            try {
                // A checagem de dono também já está dentro do handler do menu.
                await selectHandler.execute(interaction, client);
            } catch (error) {
                console.error(`Erro no menu ${interaction.customId}:`, error);
            }
        }
    },
};