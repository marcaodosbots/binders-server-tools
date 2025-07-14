// src/utils/tosCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');
const createEmbed = require('./createEmbed.js');

async function tosCheck(interaction) {
    const user = getUser(interaction.user.id);

    // se a versão dos termos do usuário for igual ou maior q a versão atual, ta liberado
    if (user.tosVersion >= currentTosVersion) {
        return true; // retorna 'true' para o comando continuar
    }

    // se chegou aqui, o usuário precisa aceitar os termos
    const isFirstTime = user.tosVersion === 0;
    
    const embed = await createEmbed(interaction, {
        title: `<:novato:1394085774567276614> Termos de Serviço e Política de Privacidade`,
        description: isFirstTime
            ? 'Bem-vindo(a)! Para usar minhas funções, você precisa concordar com nossos Termos de Serviço e Política de Privacidade. Isso garante um ambiente seguro e transparente para todos.'
            : 'Nossos Termos de Serviço foram atualizados! Para continuar usando minhas funções, por favor, leia e aceite a nova versão.',
    });

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`tos_accept_${interaction.user.id}`) // id unico pra evitar confusão
                .setLabel('Aceitar e Continuar')
                .setEmoji('<:confere:1394116085279883274>')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('Termos de Serviço')
                .setStyle(ButtonStyle.Link)
                .setURL('https://binders.carrd.co/#politicas'), // LINK PARA SEUS TERMOS
            new ButtonBuilder()
                .setLabel('Política de Privacidade')
                .setStyle(ButtonStyle.Link)
                .setURL('https://binders.carrd.co/#politicas') // LINK PARA SUA POLITICA
        );
    
    await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
    });

    return false; // retorna 'false' para barrar o comando original
}

module.exports = tosCheck;