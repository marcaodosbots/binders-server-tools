// src/interactions/buttons/tos_accept.js
const { updateUser, getUser } = require('../../../database/db.js');
const { currentTosVersion } = require('../../config/config.js');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const createEmbed = require('../../utils/createEmbed.js');
const checkInteractionOwnership = require('../../utils/interactionOwnership.js');
const getLanguage = require('../../utils/getLanguage.js');

module.exports = {
    name: 'tos_accept',
    async execute(interaction) {
        const isOwner = await checkInteractionOwnership(interaction);
        if (!isOwner) return;

        const user = getUser(interaction.user.id);
        const isFirstTime = user.tosVersion === 0;
        const lang = getLanguage(interaction);

        updateUser(interaction.user.id, 'tosVersion', currentTosVersion);
        if (isFirstTime) {
            updateUser(interaction.user.id, 'language', 'lang_auto');
        }

        if (isFirstTime) {
            const langEmbed = await createEmbed(interaction, {
                title: `<:mundo:1394088927794827350> ${lang === 'pt_BR' ? 'Vamos personalizar sua experiência!' : 'Let\'s personalize your experience!'}`,
                description: lang === 'pt_BR' ? 'Escolha como eu devo falar com você. Você poderá mudar isso a qualquer momento no futuro.' : 'Choose how I should talk to you. You can change this at any time in the future.',
            });
            const langMenu = new ActionRowBuilder().addComponents( /* ...código do menu... */ );
            return interaction.update({ embeds: [langEmbed], components: [langMenu] });
        } else {
            const updatedEmbed = await createEmbed(interaction, {
                title: `✅ ${lang === 'pt_BR' ? 'Termos Atualizados!' : 'Terms Updated!'}`,
                description: lang === 'pt_BR' ? 'Obrigado por aceitar a nova versão. Você já pode usar o comando que tentou originalmente.' : 'Thanks for accepting the new version. You can now use the command you originally tried.',
            });
            return interaction.update({ embeds: [updatedEmbed], components: [] });
        }
    }
};