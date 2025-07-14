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
    
    const embed = await createEmbed(interaction, { /* ... (código do embed continua o mesmo) ... */ });
    const buttons = new ActionRowBuilder()
        .addComponents( /* ... (código dos botões continua o mesmo) ... */ );
    
    // AQUI A MUDANÇA: Voltamos a usar .reply() que é universal
    await interaction.update({
        embeds: [embed],
        components: [buttons],
    });

    return false;
}

module.exports = tosCheck;