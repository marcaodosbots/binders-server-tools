const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const createEmbed = require('../../../utils/createEmbed.js');
const getLanguage = require('../../../utils/getLanguage.js');

const texts = {
    title: { 'pt_BR': '<:mundo:1394088927794827350> Configuração de Idioma', 'en_US': '<:mundo:1394088927794827350> Language Configuration' },
    descriptions: {
        'pt_BR': [
            "Esta configuração é **pessoal** e afeta apenas como eu respondo a **você**.\n\nSelecione uma das opções abaixo para definir sua preferência de idioma.",
            "Vamos ajustar como eu falo com você! Sua escolha de idioma é só sua e não afeta outros usuários.\n\nEscolha uma opção no menu para salvar sua preferência.",
        ],
        'en_US': [
            'This setting is **personal** and only affects how I reply to **you**.\n\nPlease select an option below to set your language preference.',
            'Let\'s adjust how I talk to you! Your language choice is yours alone and doesn\'t affect other users.\n\nChoose an option from the menu to save your preference.',
        ]
    },
    menu: {
        placeholder: { 'pt_BR': 'Selecione uma opção...', 'en_US': 'Select an option...' },
        auto_label: { 'pt_BR': 'Automático (padrão)', 'en_US': 'Automatic (default)' },
        auto_desc: { 'pt_BR': 'Minha língua vai seguir a do seu Discord.', 'en_US': 'My language will follow your Discord\'s language.' },
        pt_label: { 'pt_BR': 'Sempre Português', 'en_US': 'Always Portuguese' },
        pt_desc: { 'pt_BR': 'Eu sempre vou te responder em português.', 'en_US': 'I will always answer you in Portuguese.' },
        en_label: { 'pt_BR': 'Sempre Inglês', 'en_US': 'Always English' },
        en_desc: { 'pt_BR': 'Eu sempre vou te responder em inglês.', 'en_US': 'I will always answer you in English.' },
    }
};

module.exports = {
    async execute(interaction, client) {
        // AQUI A CORREÇÃO: avisa o discord que a gente vai responder
        await interaction.deferReply();

        const lang = getLanguage(interaction);
        const randomDescription = texts.descriptions[lang][Math.floor(Math.random() * texts.descriptions[lang].length)];

        const langEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: randomDescription,
        });

        const langMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`lang_select_${interaction.user.id}`)
                .setPlaceholder(texts.menu.placeholder[lang])
                .addOptions([
                    { label: texts.menu.auto_label[lang], description: texts.menu.auto_desc[lang], value: 'lang_auto', emoji: '⚙️' },
                    { label: texts.menu.pt_label[lang], description: texts.menu.pt_desc[lang], value: 'lang_pt_br', emoji: '🇧🇷' },
                    { label: texts.menu.en_label[lang], description: texts.menu.en_desc[lang], value: 'lang_en_us', emoji: '🇬🇧' },
                ])
        );
        
        // como a gente usou o defer, agora a gente edita a resposta 'pensando...'
        await interaction.editReply({
            embeds: [langEmbed],
            components: [langMenu],
        });
    },
};