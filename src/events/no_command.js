// src/events/no_command.js
const { MessageFlags } = require('discord.js');
const getLanguage = require('../utils/getLanguage.js'); // importa nosso detetive de idioma

// objeto com os textos traduzidos pra deixar o código limpo
const texts = {
    'pt_BR': '<:support:1393820810434576434> Estamos deixando as coisas mais incríveis! Entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que está acontecendo!',
    'en_US': '<:support:1393820810434576434> We\'re making things more awesome! Join our [support server](https://discord.gg/Y2jJadbUmY) and find out, live, what\'s going on!'
};

module.exports = {
    execute(interaction) {
        // 1. pergunta pro detetive qual lingua usar (ele vai checar o db primeiro)
        const lang = getLanguage(interaction);
        
        // 2. pega o texto certo do nosso objeto de textos com base na resposta do detetive
        const content = texts[lang];

        // 3. envia a resposta
        return interaction.reply({ 
            content: content,
            flags: [MessageFlags.Ephemeral]
        });
    },
};