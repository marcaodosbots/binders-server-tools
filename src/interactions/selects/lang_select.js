// src/interactions/selects/lang_select.js
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { updateUser } = require('../../../database/db.js');
const createEmbed = require('../../utils/createEmbed.js');
const checkInteractionOwnership = require('../../utils/interactionOwnership.js');
const getLanguage = require('../../utils/getLanguage.js');

// central de textos pra esse handler
const texts = {
    title: {
        'pt_BR': '<:salvar:1394090159879753728> Configuração Salva!',
        'en_US': '<:salvar:1394090159879753728> Settings Saved!',
    },
    description: {
        'pt_BR': 'Sua preferência de idioma foi salva. Se cometeu um erro ou quer mudar de novo, é só usar o menu abaixo!',
        'en_US': 'Your language preference has been saved. If you made a mistake or want to change it again, just use the menu below!',
    },
    menu: {
        placeholder: { 'pt_BR': 'Selecione outra opção...', 'en_US': 'Select another option...' },
        auto_label: { 'pt_BR': 'Automático (padrão)', 'en_US': 'Automatic (default)' },
        auto_desc: { 'pt_BR': 'Minha língua vai seguir a do seu Discord.', 'en_US': 'My language will follow your Discord\'s language.' },
        pt_label: { 'pt_BR': 'Sempre Português', 'en_US': 'Always Portuguese' },
        pt_desc: { 'pt_BR': 'Eu sempre vou te responder em português.', 'en_US': 'I will always answer you in Portuguese.' },
        en_label: { 'pt_BR': 'Sempre Inglês', 'en_US': 'Always English' },
        en_desc: { 'pt_BR': 'Eu sempre vou te responder em inglês.', 'en_US': 'I will always answer you in English.' },
    }
};

module.exports = {
    name: 'lang_select',
    async execute(interaction, client) {
        // segurança pra n deixar curioso clicar
        const isOwner = await checkInteractionOwnership(interaction);
        if (!isOwner) return;

        // pega a opção que o user escolheu e salva no db
        const selectedLanguage = interaction.values[0];
        updateUser(interaction.user.id, 'language', selectedLanguage);
        
        // o getLanguage já vai ler a nova config que a gente acabou de salvar
        const lang = getLanguage(interaction);

        // monta o embed de confirmação
        const finalEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: texts.description[lang],
        });
        
        // AQUI A MÁGICA: a gente recria o menu de seleção
        const newLangMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`lang_select_${interaction.user.id}`)
                .setPlaceholder(texts.menu.placeholder[lang])
                .addOptions([
                    { label: texts.menu.auto_label[lang], description: texts.menu.auto_desc[lang], value: 'lang_auto', emoji: '⚙️', default: selectedLanguage === 'lang_auto' },
                    { label: texts.menu.pt_label[lang], description: texts.menu.pt_desc[lang], value: 'lang_pt_br', emoji: '🇧🇷', default: selectedLanguage === 'lang_pt_br' },
                    { label: texts.menu.en_label[lang], description: texts.menu.en_desc[lang], value: 'lang_en_us', emoji: '🇬🇧', default: selectedLanguage === 'lang_en_us' },
                ])
        );

        // edita a msg original com o embed de confirmação E o menu novo
        return interaction.update({ embeds: [finalEmbed], components: [newLangMenu] });
    }
};