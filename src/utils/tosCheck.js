// src/utils/tosCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');
const createEmbed = require('./createEmbed.js');

async function tosCheck(interaction) {
    const user = getUser(interaction.user.id);

    if (user.tosVersion >= currentTosVersion) {
        return true; // tá liberado, pode continuar
    }

    const isFirstTime = user.tosVersion === 0;
    const isPtBr = interaction.locale === 'pt-BR';
    
    const embed = await createEmbed(interaction, {
        title: `<:novato:1394085774567276614> ${isPtBr ? 'Termos de Serviço e Política de Privacidade' : 'Terms of Service & Privacy Policy'}`,
        description: isFirstTime
            ? (isPtBr ? 'Bem-vindo(a)! Para usar minhas funções, você precisa concordar com nossos Termos. Isso garante um ambiente seguro para todos.' : 'Welcome! To use my functions, you need to agree to our Terms. This ensures a safe environment for everyone.')
            : (isPtBr ? 'Nossos Termos foram atualizados! Para continuar, por favor, leia e aceite a nova versão.' : 'Our Terms have been updated! To continue, please read and accept the new version.'),
    });

    // AQUI ESTAVA O PROBLEMA: AGORA A GENTE CRIA OS BOTÕES DE VERDADE
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
    
    // a gente checa se a interação já foi respondida ou adiada
    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
            embeds: [embed],
            components: [buttons],
            flags: [MessageFlags.Ephemeral],
        });
    } else {
        await interaction.reply({
            embeds: [embed],
            components: [buttons],
            flags: [MessageFlags.Ephemeral], // usando o jeito novo e moderno
        });
    }

    return false; // barra o comando original
}

module.exports = tosCheck;