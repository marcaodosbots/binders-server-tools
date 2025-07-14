// src/utils/interactionOwnership.js
const { MessageFlags } = require('discord.js');
const getLanguage = require('./getLanguage');

const errorMessages = {
    pt_BR: [
        '<:x_:1394185776807546963> Seu inxerido! Esse botão não é pra você!',
        '<:x_:1394185776807546963> Epa, epa! Interação privada, meu caro.',
        '<:x_:1394185776807546963> Se entrometendo... Esse botão não te pertence.',
        '<:x_:1394185776807546963> Tira a mão! Isso aqui é de outro usuário.',
        '<:x_:1394185776807546963> Cada um no seu quadrado, esse botão não é seu.'
    ],
    // adicione as mensagens em en_US aqui depois
};

async function checkInteractionOwnership(interaction) {
    // AQUI A CORREÇÃO: se o ID não tem '_', a gente assume q é um botão público
    if (!interaction.customId.includes('_')) {
        return true; // libera a passagem
    }

    // se tem '_', a gente continua com a verificação de dono normal
    const targetUserId = interaction.customId.split('_').pop();

    if (interaction.user.id !== targetUserId) {
        const lang = getLanguage(interaction);
        const langCode = lang === 'pt_BR' ? 'pt_BR' : 'en_US';
        
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