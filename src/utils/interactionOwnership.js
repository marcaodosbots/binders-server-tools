// src/utils/interactionOwnership.js
const { MessageFlags } = require('discord.js');
const getLanguage = require('./getLanguage');

// agora com as duas listas de mensagens completas
const errorMessages = {
    pt_BR: [
        '<:x_:1394185776807546963> Seu inxerido! Esse botão não é pra você!',
        '<:x_:1394185776807546963> Epa, epa! Interação privada, meu caro.',
        '<:x_:1394185776807546963> Se entrometendo... Esse botão não te pertence.',
        '<:x_:1394185776807546963> Tira a mão! Isso aqui é de outro usuário.',
        '<:x_:1394185776807546963> Cada um no seu quadrado, esse botão não é seu.'
    ],
    en_US: [
        '<:x_:1394185776807546963> Hey, meddler! This button isn\'t for you!',
        '<:x_:1394185776807546963> Whoa there! This is a private interaction.',
        '<:x_:1394185776807546963> Meddling... This button doesn\'t belong to you.',
        '<:x_:1394185776807546963> Hands off! This one is for someone else.',
        '<:x_:1394185776807546963> Not your button, not your business.'
    ]
};

async function checkInteractionOwnership(interaction) {
    // se o ID não tem '_', a gente assume q é um botão público
    if (!interaction.customId.includes('_')) {
        return true; // libera a passagem
    }

    // se tem '_', a gente continua com a verificação de dono normal
    const targetUserId = interaction.customId.split('_').pop();

    if (interaction.user.id !== targetUserId) {
        const lang = getLanguage(interaction);
        const langCode = lang === 'pt_BR' ? 'pt_BR' : 'en_US';
        
        // escolhe uma msg de erro aleatoria no idioma certo
        const randomError = errorMessages[langCode][Math.floor(Math.random() * errorMessages[langCode].length)];

        await interaction.reply({
            content: randomError,
            flags: [MessageFlags.Ephemeral]
        });
        return false; // barra a interação
    }

    return true; // se for o dono, libera a passagem
}

module.exports = checkInteractionOwnership;