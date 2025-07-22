const { SlashCommandBuilder } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const path = require('node:path');
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
                .setName('idioma') //por favor, nao me julgue, so que colocar a description localization em ingles nao tava indo por algum motivo....
                .setNameLocalizations({ 'en-US': 'language' })
                .setDescription('Personalization ❯ Changes your preferred language.')
                .setDescriptionLocalizations({
                    'pt-BR': 'Personalização ❯ Altera o seu idioma de preferência.',
                })
        ),

    async execute(interaction, client) {
        const canProceed = await tosCheck(interaction);
        if (!canProceed) return;
        
        const subCommandName = interaction.options.getSubcommand();
        
        try {
            const subCommandPath = path.join(process.cwd(), 'src', 'subcommands', 'binder', 'personalizacao', `${subCommandName}.js`);
            const subCommand = require(subCommandPath);
            await subCommand.execute(interaction, client);
        } catch (error) {
            console.error(`Erro ao carregar o subcomando '${subCommandName}':`, error);
            return interactionErrorHandler.execute(interaction, error);
        }
    },
};