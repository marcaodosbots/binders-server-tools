// src/interactions/buttons/tos_accept.js
const { updateUser, getUser } = require('../../../database/db.js'); // <-- CAMINHO CORRIGIDO
const { currentTosVersion } = require('../../config/config.js');  // <-- CAMINHO CORRIGIDO
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const createEmbed = require('../../utils/createEmbed.js'); // <-- CAMINHO CORRIGIDO

module.exports = {
    name: 'tos_accept',
    async execute(interaction) {
        const user = getUser(interaction.user.id);
        const isFirstTime = user.tosVersion === 0;

        updateUser(interaction.user.id, 'tosVersion', currentTosVersion);
        updateUser(interaction.user.id, 'language', 'lang_auto'); // define o padrão como automático

        if (isFirstTime) {
            const langEmbed = await createEmbed(interaction, {
                title: `<:mundo:1394088927794827350> Vamos personalizar sua experiência!`,
                description: 'Escolha como eu devo falar com você. Você poderá mudar isso a qualquer momento no futuro com o comando `/preferencias`.',
            });
            const langMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId(`lang_select_${interaction.user.id}`).setPlaceholder('Selecione uma opção de idioma...').addOptions([
                    { label: 'Automático (padrão)', description: 'Minha língua vai seguir a do seu Discord.', value: 'lang_auto', emoji: '⚙️' },
                    { label: 'Sempre Português', description: 'Eu sempre vou te responder em português.', value: 'lang_pt_br', emoji: '🇧🇷' },
                    { label: 'Always English', description: 'I will always answer you in English.', value: 'lang_en_us', emoji: '🇬🇧' },
                ])
            );
            return interaction.update({ embeds: [langEmbed], components: [langMenu] });
        } else {
            const updatedEmbed = await createEmbed(interaction, {
                title: '✅ Termos Atualizados!',
                description: 'Obrigado por aceitar a nova versão dos nossos termos. Você já pode usar o comando que tentou originalmente.',
            });
            return interaction.update({ embeds: [updatedEmbed], components: [] });
        }
    }
};