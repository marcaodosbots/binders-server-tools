// src/utils/tosCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
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
        title: `<:novato:1394085774567276614> ${isPtBr ? 'Termos de Serviço e Política de Privacidade' : 'Terms of Service & Privacy Policy'}`,
        description: isFirstTime
            ? (isPtBr ? 'Bem-vindo(a)! Para usar minhas funções, você precisa concordar com nossos Termos.' : 'Welcome! To use my functions, you need to agree to our Terms.')
            : (isPtBr ? 'Nossos Termos foram atualizados! Por favor, leia e aceite a nova versão.' : 'Our Terms have been updated! Please read and accept the new version.'),
    });

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`tos_accept_${interaction.user.id}`).setLabel(isPtBr ? 'Aceitar e Continuar' : 'Accept and Continue').setEmoji('<:confere:1394116085279883274>').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel(isPtBr ? 'Termos de Serviço' : 'Terms of Service').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/#politicas'),
            new ButtonBuilder().setLabel(isPtBr ? 'Política de Privacidade' : 'Privacy Policy').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/#politicas')
        );
    
    const payload = {
        embeds: [embed],
        components: [buttons],
        ephemeral: true, // vamos manter efêmero para não poluir o chat para comandos /
    };
    
    // Lógica de resposta inteligente
    if (interaction.deferred || interaction.replied) {
        // se a interação já foi "adiada" ou respondida, a gente edita a resposta
        await interaction.editReply(payload);
    } else if (interaction.isButton()) {
        // se for um clique de botão (como o 'vamos lá'), a gente atualiza a mensagem original
        await interaction.update(payload);
    }
     else {
        // se for uma interação nova (como um comando /), a gente cria uma resposta
        await interaction.reply(payload);
    }

    return false;
}

module.exports = tosCheck;