const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js'); // <-- CAMINHO CORRIGIDO

const greetings = {
    en_US: ['Hey, ${displayName}!', 'Hello, ${displayName}!', 'Hi there, ${displayName}!', 'Greetings, ${displayName}!', 'What\'s up, ${displayName}?', 'Good to see you, ${displayName}!', 'How can I help, ${displayName}?', 'At your service, ${displayName}!', 'You summoned me, ${displayName}?', 'Binder at your command, ${displayName}!'],
    pt_BR: ['<:mencao:1393999045248417924> E aí, ${displayName}!', '<:mencao:1393999045248417924> Fala tu, ${displayName}!', '<:mencao:1393999045248417924> Opa opa, ${displayName} chegou!', '<:mencao:1393999045248417924> Salve, ${displayName}!', '<:mencao:1393999045248417924> Como tamo, ${displayName}?', '<:mencao:1393999045248417924> Bom te ver por aqui, ${displayName}!', '<:mencao:1393999045248417924> Tudo certo por aí, ${displayName}?', '<:mencao:1393999045248417924> Chama que eu venho, ${displayName}!', '<:mencao:1393999045248417924> Tô na área, ${displayName}!', '<:mencao:1393999045248417924> Diz aí, ${displayName}! Tô pronto pro que der e vier.']
};

const descriptions = {
    en_US: ["I'm ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, here to help you and provide utilities for your server. To use my commands, just type **'/'** and look for the desired command."],
    pt_BR: ["Eu sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> e tô aqui pra dar aquela força no seu servidor! Eu tenho utilidades e posso ser integrado em diferentes plataformas. Digita **'/'** e bora ver o que dá pra fazer."]
};

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        if (message.author.bot || !message.mentions.has(client.user.id)) return;

        const langCode = getLanguage(message);
        const lang = langCode === 'pt_BR' ? 'pt_BR' : 'en_US';
        
        const userData = getUser(message.author.id);

        // CHECA SE O USUÁRIO PRECISA ACEITAR OS TERMOS
        if (userData.tosVersion < currentTosVersion) {
            const isFirstTime = userData.tosVersion === 0;
            const welcomeEmbed = await createEmbed(message, {
                title: isFirstTime ? `<:novato:1394085774567276614> Boas-vindas!` : `<:anuncio:1394142606535033017> Termos de Serviço Atualizados!`,
                description: isFirstTime 
                    ? `Prazer em te conhecer, sou o ${client.user.username} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>! Para começarmos, preciso que você leia e aceite nossos Termos de Serviço clicando no botão abaixo.`
                    : `Olá! Nossos termos foram atualizados. Por favor, leia e aceite a nova versão para continuar.`,
            });
            const tosButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`start_tos_${message.author.id}`)
                    .setLabel('Vamos lá!')
                    .setEmoji('<:carta:1394142002404135003>')
                    .setStyle(ButtonStyle.Secondary)
            );
            return message.reply({ embeds: [welcomeEmbed], components: [tosButtonRow] });
        }

        // SE OS TERMOS ESTIVEREM OK, MANDA A RESPOSTA NORMAL
        const botPermissions = message.guild.members.me.permissionsIn(message.channel);
        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) { /* ...código de DM... */ return; }

        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);

        const displayName = message.member ? message.member.displayName : message.author.username;
        const randomGreetingTemplate = greetings[lang][Math.floor(Math.random() * greetings[lang].length)];
        const title = randomGreetingTemplate.replace('${displayName}', displayName);

        const botGlobalName = "Binder's Server Tools";
        const randomDescriptionTemplate = descriptions[lang][Math.floor(Math.random() * descriptions[lang].length)];
        const description = randomDescriptionTemplate.replace('${botName}', botGlobalName);

        const buttonLabels = {
            commands: lang === 'pt_BR' ? 'Ver comandos' : 'View Commands',
            website: lang === 'pt_BR' ? 'Site' : 'Website',
            support: lang === 'pt_BR' ? 'Suporte' : 'Support'
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('show_help_menu').setLabel(buttonLabels.commands).setEmoji('<:informacao:1393822533454921869>').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel(buttonLabels.website).setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
            new ButtonBuilder().setLabel(buttonLabels.support).setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc'),
            new ButtonBuilder().setLabel('Top.gg').setEmoji('<:bot:1393821258851946606>').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/')
        );
        let responsePayload = { components: [row] };
        if (canSendEmbeds) {
            const embed = await createEmbed(message, { title: title, description: description });
            responsePayload.embeds = [embed];
        } else { /* ...código de resposta sem embed... */ }
        
        if (canReadHistory) { await message.reply(responsePayload); } 
        else { await message.channel.send(responsePayload); }
    },
};