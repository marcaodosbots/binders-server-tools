// src/commands/Configuracao/binder.js
const { SlashCommandBuilder } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const path = require('node:path');
// 1. IMPORTA O NOSSO GERENTE DE ERROS
const interactionErrorHandler = require('../utils/interactionErrorHandler.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('binder')
        .setDescription('Comandos centrais do Binder\'s Server Tools')
        .setDescriptionLocalizations({
            'en-US': 'Core commands for Binder\'s Server Tools',
            'pt-BR': 'Comandos centrais do Binder\'s Server Tools',
        })
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addSubcommand(subcommand =>
            subcommand
                .setName('idioma')
                .setNameLocalizations({ 'en-US': 'language' })
                .setDescription('Personalização ❯ Altera o seu idioma de preferência.')
        ),

    async execute(interaction, client) {
        const canProceed = await tosCheck(interaction);
        if (!canProceed) return;
        
        const subCommandName = interaction.options.getSubcommand();
        
        try {
            const subCommandPath = path.join(process.cwd(), 'src', 'subcommands', 'binder', 'Personalizacao', `${subCommandName}.js`);
            const subCommand = require(subCommandPath);
            await subCommand.execute(interaction, client);
        } catch (error) {
            console.error(`Erro ao carregar ou executar o subcomando '${subCommandName}':`, error);
            
            // 2. AQUI A MUDANÇA: em vez de uma msg feia, ele passa o problema pro especialista
            return interactionErrorHandler.execute(interaction, error);
        }
    },
};