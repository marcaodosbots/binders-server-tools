// src/interactions/selects/lang_select.js
const { updateUser } = require('../../../database/db.js'); // <-- O CAMINHO CERTO
const createEmbed = require('../../utils/createEmbed.js'); // <-- CAMINHO CORRIGIDO

module.exports = {
    name: 'lang_select',
    async execute(interaction) {
        const selectedLanguage = interaction.values[0];
        updateUser(interaction.user.id, 'language', selectedLanguage);
        
        const finalEmbed = await createEmbed(interaction, {
            title: `<:salvar:1394090159879753728> Configuração Salva!`,
            description: 'Sua preferência de idioma foi salva com sucesso. Tudo pronto! Agora você pode usar o comando que tentou originalmente.',
        });

        return interaction.update({ embeds: [finalEmbed], components: [] });
    }
};