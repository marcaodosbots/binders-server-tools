const { updateUser } = require('../../../database/db.js');

module.exports = {
    name: 'lang_select', // o começo do customId do menu
    async execute(interaction) {
        const selectedLanguage = interaction.values[0];
        updateUser(interaction.user.id, 'language', selectedLanguage);
        return interaction.update({ content: '✅ Preferência de idioma salva! Tudo pronto. Agora você pode usar o comando que tentou originalmente.', embeds: [], components: [] });
    }
};