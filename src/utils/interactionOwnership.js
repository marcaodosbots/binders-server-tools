// src/utils/interactionOwnership.js
const { MessageFlags } = require('discord.js'); // importa a ferramenta nova
const getLanguage = require('./getLanguage');

// mensagens de erro aleatorias para quando um curioso clica no botão do outro
const errorMessages = {
    en_US: [
        '<:x_:1394185776807546963> Hey, meddler! This button isn\'t for you!',
        '<:x_:1394185776807546963> This interaction is private, sorry!',
        '<:x_:1394185776807546963> You can\'t use this, only the person who triggered it can.',
        '<:x_:1394185776807546963> Oops! Looks like you tried to click someone else\'s button.',
        '<:x_:1394185776807546963> Hands off! This belongs to someone else.'
    ],
    pt_BR: [
        '<:x_:1394185776807546963> Seu inxerido! Esse botão não é pra você!',
        '<:x_:1394185776807546963> Epa, epa! Interação privada, meu caro.',
        '<:x_:1394185776807546963> Você não pode usar isso, só a pessoa que pediu o comando.',
        '<:x_:1394185776807546963> Se entrometendo... Esse botão não te pertence.',
        '<:x_:1394185776807546963> Tira a mão! Isso aqui é de outro usuário.'
    ]
};
async function checkInteractionOwnership(interaction) {
    if (!interaction.customId.includes('_')) return true;
    const targetUserId = interaction.customId.split('_').pop();

    if (interaction.user.id !== targetUserId) {
        const lang = getLanguage(interaction);
        const langCode = lang === 'pt_BR' ? 'pt_BR' : 'en_US';
        const randomError = errorMessages[langCode][Math.floor(Math.random() * errorMessages[langCode].length)];
        
        await interaction.reply({
            content: randomError,
            flags: [MessageFlags.Ephemeral] // <-- JEITO NOVO E MODERNO
        });
        return false;
    }
    return true;
}

module.exports = checkInteractionOwnership;