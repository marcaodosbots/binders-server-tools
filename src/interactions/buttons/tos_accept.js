const { updateUser, getUser } = require('../../../database/db.js');
const { currentTosVersion } = require('../../../src/config/config.js');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tos_accept', // o começo do customId do botão
    async execute(interaction) {
        const user = getUser(interaction.user.id);
        const isFirstTime = user.tosVersion === 0;

        updateUser(interaction.user.id, 'tosVersion', currentTosVersion);

        if (isFirstTime) {
            const langEmbed = new EmbedBuilder().setColor('#9F9AAF').setTitle('<:mundo:1394088927794827350> Vamos personalizar sua experiência!').setDescription('Escolha como eu devo falar com você. Você poderá mudar isso a qualquer momento no futuro com o comando `/preferencias`.');
            const langMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId(`lang_select_${interaction.user.id}`).setPlaceholder('Selecione uma opção de idioma...').addOptions([
                    { label: 'Automático (padrão)', description: 'Minha língua vai seguir a do seu Discord.', value: 'lang_auto' },
                    { label: 'Sempre Português', description: 'Eu sempre vou te responder em português.', value: 'lang_pt_br' },
                    { label: 'Sempre Inglês', description: 'I will always answer you in English.', value: 'lang_en_us' },
                ])
            );
            return interaction.update({ embeds: [langEmbed], components: [langMenu] });
        } else {
            return interaction.update({ content: '✅ Termos atualizados com sucesso! Você já pode usar o comando novamente.', embeds: [], components: [] });
        }
    }
};