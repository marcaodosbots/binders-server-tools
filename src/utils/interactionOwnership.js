const { MessageFlags } = require('discord.js');
const getLanguage = require('./getLanguage');

// msgs pro curioso que clica onde n deve
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
    // se o customId n tem '_', a gente assume q é um botão público e libera geral
    if (!interaction.customId?.includes('_')) {
        return true;
    }

    // se tem '_', é privado, tem q checar o dono
    const targetUserId = interaction.customId.split('_').pop();

    if (interaction.user.id !== targetUserId) {
        const lang = getLanguage(interaction);
        
        // pega uma msg aleatoria de 'sai daqui' na lingua certa
        const randomError = errorMessages[lang][Math.floor(Math.random() * errorMessages[lang].length)];

        await interaction.reply({
            content: randomError,
            flags: [MessageFlags.Ephemeral]
        });
        return false; // barra o curioso
    }

    // se chegou até aqui, é o dono. liberado.
    return true;
}

module.exports = checkInteractionOwnership;