// src/interactions/buttons/show_help_menu.js
const { MessageFlags } = require('discord.js');
const createEmbed = require('../../utils/createEmbed.js');
const getLanguage = require('../../utils/getLanguage.js');

// centraliza os textos aqui em cima pra deixar a função execute mais limpa
const texts = {
    title: {
        'pt_BR': '<:support:1393820810434576434> Em manutenção!',
        'en_US': '<:support:1393820810434576434> Under maintenance!',
    },
    description: {
        'pt_BR': 'Estamos deixando as coisas mais incríveis! Entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que está acontecendo!',
        'en_US': 'We\'re making things more awesome! Join our [support server](https://discord.gg/Y2jJadbUmY) and find out, live, what\'s going on!',
    }
};

module.exports = {
    // nome do handler, tem q bater com o customId do botão
    name: 'show_help_menu',
    
    async execute(interaction) {
        // o 'checkInteractionOwnership' ja foi feito no roteador
        const lang = getLanguage(interaction);

        // monta o embed usando os textos do idioma certo
        const helpEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: texts.description[lang],
        });

        return interaction.reply({ 
            embeds: [helpEmbed],
            flags: [MessageFlags.Ephemeral]
        });
    }
};