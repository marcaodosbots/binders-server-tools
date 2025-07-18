const { MessageFlags } = require('discord.js');
const getLanguage = require('./getLanguage.js');
const createEmbed = require('./createEmbed.js');
const { logErrorToWebhook } = require('./logHandler.js');

const texts = {
    title: {
        'pt_BR': '<:x_:1394185776807546963> Opa, algo deu errado!',
        'en_US': '<:x_:1394185776807546963> Oops, something went wrong!',
    },
    description: {
        'pt_BR': 'Não consegui processar sua solicitação. Pode ser um comando que não existe ou um erro interno.\n\nSe o problema continuar, por favor, entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e nos avise!',
        'en_US': 'I couldn\'t process your request. It might be a command that doesn\'t exist or an internal error.\n\nIf the problem persists, please join our [support server](https://discord.gg/Y2jJadbUmY) and let us know!',
    }
};

module.exports = {
    async execute(interaction, error) {
        // manda pros logs
        await logErrorToWebhook(interaction, error);

        // msg simples pra pessoa
        const lang = getLanguage(interaction);
        const errorEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: texts.description[lang],
        });

        if (interaction.deferred || interaction.replied) {
            return interaction.followUp({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }
        return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
    },
};