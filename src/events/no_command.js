const { MessageFlags } = require('discord.js');
const getLanguage = require('../utils/getLanguage.js'); // nosso detetive de idioma

// msgs de erro pra comando q n existe
const errorTexts = {
    'pt_BR': '<:support:1393820810434576434> Estamos deixando as coisas mais incríveis! Entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que está acontecendo!',
    'en_US': '<:support:1393820810434576434> We\'re making things more awesome! Join our [support server](https://discord.gg/Y2jJadbUmY) and find out, live, what\'s going on!'
};

module.exports = {
    // esse 'ajudante' é chamado pelo interactionCreate qnd o comando n é encontrado
    async execute(interaction) {
        // pega a lingua e o texto correspondente de uma vez só
        const content = errorTexts[getLanguage(interaction)];

        // checagem de segurança pra evitar resposta dupla
        if (interaction.deferred || interaction.replied) {
            return interaction.followUp({
                content: content,
                flags: [MessageFlags.Ephemeral]
            });
        }

        return interaction.reply({ 
            content: content,
            flags: [MessageFlags.Ephemeral]
        });
    },
};