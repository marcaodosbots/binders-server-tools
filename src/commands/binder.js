const { SlashCommandBuilder } = require('discord.js');
const tosCheck = require('../utils/tosCheck.js');
const path = require('node:path');
const interactionErrorHandler = require('../utils/interactionErrorHandler.js');
const devSubcommandHandler = require('../utils/devSubcommandHandler.js');

// lista de subcomandos que ainda estão em desenvolvimento
const subcommandsInDevelopment = [
    'info'
];

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

                .setDescriptionLocalizations({
                    'en-US': 'Personalization ❯ Changes your preferred language.',
                    'pt-BR': 'Personalização ❯ Altera o seu idioma de preferência.',
                })
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Bot ❯ Mostra informações detalhadas sobre mim.')

                .setDescriptionLocalizations({
                    'en-US': 'Bot ❯ Displays detailed information about me.',
                    'pt-BR': 'Bot ❯ Mostra informações detalhadas sobre mim.',
                })
        ),

    async execute(interaction, client) {
        const canProceed = await tosCheck(interaction);
        if (!canProceed) return;
        
        const subCommandName = interaction.options.getSubcommand();

        if (subcommandsInDevelopment.includes(subCommandName)) {
            return devSubcommandHandler.execute(interaction);
        }
        
        const categoryMap = {
            'idioma': 'Personalizacao',
            'info': 'Bot',
        };
        const category = categoryMap[subCommandName];

        if (!category) {
            const error = new Error(`Categoria de subcomando não encontrada para: ${subCommandName}`);
            return interactionErrorHandler.execute(interaction, error);
        }
        
        try {
            const subCommandPath = path.join(process.cwd(), 'src', 'subcommands', 'binder', category, `${subCommandName}.js`);
            const subCommand = require(subCommandPath);
            await subCommand.execute(interaction, client);
        } catch (error) {
            console.error(`Erro ao carregar o subcomando '${subCommandName}':`, error);
            return interactionErrorHandler.execute(interaction, error);
        }
    },
};