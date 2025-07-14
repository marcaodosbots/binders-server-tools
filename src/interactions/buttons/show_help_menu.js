// src/interactions/buttons/show_help_menu.js
const { MessageFlags } = require('discord.js');
const createEmbed = require('../../utils/createEmbed.js');
const getLanguage = require('../../utils/getLanguage.js');

module.exports = {
    // o nome tem que ser EXATAMENTE esse pra bater com o customId
    name: 'show_help_menu',
    
    async execute(interaction) {
        // o 'checkInteractionOwnership' já rodou no roteador, entao aqui estamos seguros
        const lang = getLanguage(interaction);

        const helpEmbed = await createEmbed(interaction, {
            title: lang === 'pt_BR' ? '📜 Meus Comandos' : '📜 My Commands',
            description: lang === 'pt_BR' 
                ? '<:support:1393820810434576434> Estamos deixando as coisas mais incríveis! Entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que está acontecendo!'
                : '<:support:1393820810434576434> We\'re making things more awesome! Join our [support server](https://discord.gg/Y2jJadbUmY) and find out, live, what\'s going on!',
        });

        return interaction.reply({ 
            embeds: [helpEmbed],
            flags: [MessageFlags.Ephemeral] // resposta privada
        });
    }
}