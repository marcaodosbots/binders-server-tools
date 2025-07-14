// src/interactions/selects/lang_select.js
const { updateUser } = require('../../../database/db.js'); // <-- CAMINHO CORRIGIDO
const createEmbed = require('../../utils/createEmbed.js');
const checkInteractionOwnership = require('../../utils/interactionOwnership.js');
const getLanguage = require('../../utils/getLanguage.js');

module.exports = {
    name: 'lang_select',
    async execute(interaction) {
        const isOwner = await checkInteractionOwnership(interaction);
        if (!isOwner) return;

        const selectedLanguage = interaction.values[0];
        updateUser(interaction.user.id, 'language', selectedLanguage);
        
        const lang = getLanguage(interaction);

        const finalEmbed = await createEmbed(interaction, {
            title: `<:salvar:1394090159879753728> ${lang === 'pt_BR' ? 'Configuração Salva!' : 'Settings Saved!'}`,
            description: lang === 'pt_BR' ? 'Sua preferência de idioma foi salva com sucesso. Tudo pronto!' : 'Your language preference has been successfully saved. All set!',
        });

        return interaction.update({ embeds: [finalEmbed], components: [] });
    }
};