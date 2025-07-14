// src/utils/tosCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js'); // <-- CAMINHO CORRIGIDO
const createEmbed = require('./createEmbed.js');

async function tosCheck(interaction) {
    const user = getUser(interaction.user.id);

    if (user.tosVersion >= currentTosVersion) {
        return true;
    }

    const isFirstTime = user.tosVersion === 0;
    const isPtBr = interaction.locale === 'pt-BR';
    
    const embed = await createEmbed(interaction, { /* ...código do embed... */ });
    const buttons = new ActionRowBuilder().addComponents( /* ...código dos botões... */ );
    
    await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
    });

    return false;
}
// Cole o código completo que já fizemos para essa função. A única mudança é na linha 4.
module.exports = tosCheck;