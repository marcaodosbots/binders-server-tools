const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');
const createEmbed = require('./createEmbed.js');
const getLanguage = require('./getLanguage.js');

// central de textos pra esse handler
const texts = {
    welcome: {
        title: { 'pt_BR': '<:novato:1394085774567276614> Termos de Serviço e Política de Privacidade', 'en_US': '<:novato:1394085774567276614> Terms of Service & Privacy Policy' },
        description: { 'pt_BR': 'Bem-vindo(a)! Para usar minhas funções, você precisa concordar com nossos Termos. Isso garante um ambiente seguro para todos.', 'en_US': 'Welcome! To use my functions, you need to agree to our Terms. This ensures a safe environment for everyone.' }
    },
    update: {
        title: { 'pt_BR': '<:anuncio:1394142606535033017> Termos de Serviço Atualizados!', 'en_US': '<:anuncio:1394142606535033017> Terms of Service Updated!' },
        description: { 'pt_BR': 'Nossos Termos foram atualizados! Para continuar, por favor, leia e aceite a nova versão.', 'en_US': 'Our Terms have been updated! To continue, please read and accept the new version.' }
    },
    buttons: {
        accept: { 'pt_BR': 'Aceitar e Continuar', 'en_US': 'Accept and Continue' },
        terms: { 'pt_BR': 'Termos de Serviço', 'en_US': 'Terms of Service' },
        privacy: { 'pt_BR': 'Política de Privacidade', 'en_US': 'Privacy Policy' }
    }
};

async function tosCheck(interaction) {
    const user = getUser(interaction.user.id);

    // se o user já aceitou a versão atual ou uma mais nova, tá liberado
    if (user.tosVersion >= currentTosVersion) {
        return true;
    }

    // se chegou aqui, o user precisa aceitar os termos
    const lang = getLanguage(interaction);
    const isFirstTime = user.tosVersion === 0;
    const textKey = isFirstTime ? 'welcome' : 'update';
    
    const embed = await createEmbed(interaction, {
        title: texts[textKey].title[lang],
        description: texts[textKey].description[lang],
    });

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`tos_accept_${interaction.user.id}`).setLabel(texts.buttons.accept[lang]).setEmoji('<:confere:1394116085279883274>').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel(texts.buttons.terms[lang]).setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/#politicas'),
            new ButtonBuilder().setLabel(texts.buttons.privacy[lang]).setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/#politicas')
        );
    
    const payload = {
        embeds: [embed],
        components: [buttons],
        flags: [MessageFlags.Ephemeral],
    };
    
    // logica pra responder sem quebrar a api
    if (interaction.isButton()) {
        await interaction.update(payload);
    } else {
        await interaction.reply(payload);
    }

    return false; // barra o comando original
}

module.exports = tosCheck;