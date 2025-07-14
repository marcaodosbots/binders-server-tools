// src/utils/tosCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');
const createEmbed = require('./createEmbed.js');

async function tosCheck(interaction) {
    const user = getUser(interaction.user.id);

    if (user.tosVersion >= currentTosVersion) {
        return true;
    }

    const isFirstTime = user.tosVersion === 0;
    const isPtBr = interaction.locale === 'pt-BR';
    
    const embed = await createEmbed(interaction, {
        title: `<:novato:1394085774567276614> Termos de Serviço e Política de Privacidade`,
        description: isFirstTime
            ? (isPtBr ? 'Bem-vindo(a)! Para usar minhas funções, você precisa concordar com nossos Termos de Serviço e Política de Privacidade.' : 'Welcome! To use my functions, you need to agree to our Terms of Service and Privacy Policy.')
            : (isPtBr ? 'Nossos Termos de Serviço foram atualizados! Por favor, leia e aceite a nova versão.' : 'Our Terms of Service have been updated! Please read and accept the new version.'),
    });

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`tos_accept_${interaction.user.id}`)
                .setLabel(isPtBr ? 'Aceitar e Continuar' : 'Accept and Continue')
                .setEmoji('<:confere:1394116085279883274>')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel(isPtBr ? 'Termos de Serviço' : 'Terms of Service')
                .setStyle(ButtonStyle.Link)
                .setURL('https://binders.carrd.co/#politicas'),
            new ButtonBuilder()
                .setLabel(isPtBr ? 'Política de Privacidade' : 'Privacy Policy')
                .setStyle(ButtonStyle.Link)
                .setURL('https://binders.carrd.co/#politicas')
        );
    
    // AQUI A MUDANÇA: trocamos .reply() por .update()
    // Isso vai editar a mensagem original em vez de responder
    await interaction.update({
        embeds: [embed],
        components: [buttons],
    });

    return false; // barra o comando original
}

module.exports = tosCheck;