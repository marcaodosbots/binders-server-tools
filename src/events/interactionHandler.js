// src/events/interactionCreate.js
const { Events } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const { updateUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    
    async execute(interaction, client) {
        // --- Porteiro dos Termos de Serviço ---
        // a gente checa os termos antes de fazer QUALQUER outra coisa
        // mas a gente ignora a checagem pro proprio botão de aceitar os termos
        if (interaction.customId !== `tos_accept_${interaction.user.id}`) {
            const canProceed = await tosCheck(interaction);
            if (!canProceed) return; // se o porteiro barrou, para tudo aqui
        }

        // --- Lógica para Comandos de Barra (Slash Commands) ---
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
                await interaction.reply({ content: 'Deu um erro ao executar esse comando!', ephemeral: true });
            }
            return;
        }

        // --- Lógica para Botões ---
        if (interaction.isButton()) {
            // checa se é o nosso botão de aceitar os termos
            if (interaction.customId === `tos_accept_${interaction.user.id}`) {
                // a checagem pra ver se o botão é do usuário certo já está no tosCheck
                // então aqui a gente só atualiza
                updateUser(interaction.user.id, 'tosVersion', currentTosVersion);
                
                // aqui virá a lógica da seleção de idioma no futuro
                await interaction.update({
                    content: '✅ Termos aceitos com sucesso! Agora você pode usar o comando que tentou originalmente.',
                    embeds: [],
                    components: [],
                });
            }

            // se o botão for o de 'veja meus comandos' da menção...
            if (interaction.customId === 'show_help_menu') {
                // AQUI virá a lógica para mostrar o menu de ajuda
                await interaction.reply({
                    content: 'Aqui será exibida a lista de comandos! (Ainda em construção)',
                    ephemeral: true,
                });
            }
        }
        
        // --- Lógica para Menus de Seleção (Select Menus) ---
        // if (interaction.isStringSelectMenu()) {
        //     // aqui virá a lógica para o menu de seleção de linguas
        // }
    },
};