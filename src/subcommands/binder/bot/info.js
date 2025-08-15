// src/subcommands/binder/bot/info.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const createEmbed = require('../../../utils/createEmbed.js');
const getLanguage = require('../../../utils/getLanguage.js');

const texts = {
    emojis: ['<:foguete:1397390505171615827>', '<:informacao:1393822533454921869>', '<:lupa:1397390427664941056>', '<:estrela:1397390959137914950>', '<:brilho:1397390670540439624>'],
    titles: {
        'pt_BR': ['Sobre mim!', 'Conheça o Binder', 'Informações do Bot', 'Quem sou eu?'],
        'en_US': ['About me!', 'Meet Binder', 'Bot Information', 'Who am I?'],
    },
    descriptions: {
        'pt_BR': [
            "Olá! Sou o Binder's Server Tools... Fui desenvolvido em <:djs:1397399961259474974> Discord.js e atualmente ajudo **${userCount}** usuários em **${serverCount}** servidores!",
            "E aí! Me chamo Binder's Server Tools... Feito com <:djs:1397399961259474974> Discord.js, hoje estou presente em **${serverCount}** servidores, servindo **${userCount}** usuários.",
        ],
        'en_US': [
            "Hello! I'm Binder's Server Tools... I was developed in <:djs:1397399961259474974> Discord.js and I'm currently helping **${userCount}** users across **${serverCount}** servers!",
            "Hey there! My name is Binder's Server Tools... Made with <:djs:1397399961259474974> Discord.js, I'm currently in **${serverCount}** servers, serving **${userCount}** users.",
        ]
    }
};

module.exports = {
    async execute(interaction, client) {
        // AQUI A MUDANÇA: avisa o discord q a gente vai responder
        await interaction.deferReply();

        const lang = getLanguage(interaction);
        const serverCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const randomEmoji = texts.emojis[Math.floor(Math.random() * texts.emojis.length)];
        const randomTitle = texts.titles[lang][Math.floor(Math.random() * texts.titles[lang].length)];
        let randomDescription = texts.descriptions[lang][Math.floor(Math.random() * texts.descriptions[lang].length)];
        
        randomDescription = randomDescription.replace('${userCount}', userCount.toLocaleString(lang === 'pt_BR' ? 'pt-BR' : 'en-US')).replace('${serverCount}', serverCount.toLocaleString(lang === 'pt_BR' ? 'pt-BR' : 'en-US'));

        const homeEmbed = await createEmbed(interaction, {
            title: `[1/4] ${randomEmoji} ${randomTitle}`,
            description: randomDescription,
        });
        homeEmbed.setImage('attachment://banner.png');

        const navMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`botinfo_nav_${interaction.user.id}`)
                .setPlaceholder(lang === 'pt_BR' ? 'Navegue pelas informações...' : 'Navigate through the info...')
                .addOptions([
                    { label: 'Página Inicial', value: 'page_home', emoji: '🏠', default: true },
                    { label: 'RG do Bot', value: 'page_credits', emoji: '📜' },
                    { label: 'Hospedagem', value: 'page_host', emoji: '🖥️' },
                    { label: 'Agradecimentos', value: 'page_thanks', emoji: '💖' },
                ])
        );
        const linkRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Adicionar o Bot').setEmoji('<:mais:1397392605914071062>').setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
            new ButtonBuilder().setLabel('Servidor de Suporte').setEmoji('<:suporte:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc'),
            new ButtonBuilder().setLabel('Vote no Top.gg').setEmoji('<:ticket:1397392207379566602>').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/'),
            new ButtonBuilder().setLabel('GitHub').setEmoji('<:github:1397393764900933774>').setStyle(ButtonStyle.Link).setURL('https://github.com/marcaodosbots/binders-server-tools')
        );

        // AQUI A MUDANÇA: usa editReply porque a gente deu 'defer'
        await interaction.editReply({ 
            embeds: [homeEmbed],
            components: [navMenu, linkRow],
            files: ['./assets/banner.png']
        });
    },
};