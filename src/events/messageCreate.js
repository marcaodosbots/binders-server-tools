const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, MessageType } = require('discord.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');

// textos

const getLocalizedTexts = (lang, guildName, channelName, clientUsername) => {
    const isPtBr = lang === 'pt_BR';
    const botName = "Binder's Server Tools";
    const verifiedEmojis = "<:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>";

    const greetings = {
        en_US: ['Hey, ${displayName}!', 'Hello, ${displayName}!', 'Hi there, ${displayName}!', 'Greetings, ${displayName}!', 'What\'s up, ${displayName}?'],
        pt_BR: ['<:mencao:1393999045248417924> E aí, ${displayName}!', '<:mencao:1393999045248417924> Fala tu, ${displayName}!', '<:mencao:1393999045248417924> Opa opa, ${displayName} chegou!', '<:mencao:1393999045248417924> Salve, ${displayName}!', '<:mencao:1393999045248417924> Como tamo, ${displayName}?']
    };

    const descriptions = {
        en_US: `I'm ${botName} ${verifiedEmojis}, here to help you and provide utilities for your server. To use my commands, just type **'/'** and look for the desired command.`,
        pt_BR: `Eu sou o ${botName} ${verifiedEmojis} e tô aqui pra dar aquela força no seu servidor! Eu tenho utilidades e posso ser integrado em diferentes plataformas. Digita **'/'** e bora ver o que dá pra fazer.`
    };

    return {
        greeting: greetings[lang][Math.floor(Math.random() * greetings[lang].length)],
        description: descriptions[lang],
        tos_welcome_title: isPtBr ? `<:novato:1394085774567276614> Boas-vindas!` : `<:novato:1394085774567276614> Welcome!`,
        tos_update_title: isPtBr ? `<:anuncio:1394142606535033017> Termos Atualizados!` : `<:anuncio:1394142606535033017> Terms Updated!`,
        tos_welcome_desc: isPtBr ? `Prazer em te conhecer, sou o ${clientUsername}! Para começarmos, preciso que você leia e aceite nossos Termos clicando no botão abaixo.` : `Nice to meet you, I'm ${clientUsername}! To get started, please read and accept our Terms by clicking the button below.`,
        tos_update_desc: isPtBr ? `Olá! Nossos termos foram atualizados. Por favor, leia e aceite a nova versão para continuar.` : `Hello! Our terms have been updated. Please read and accept the new version to continue.`,
        dm_cant_speak: isPtBr ? `Oi! Vi que você me mencionou lá no servidor "**${guildName}**", mas não consigo responder no canal #${channelName}. Se precisar, me chama em outro canal ou cola no meu servidor de suporte!` : `Hello! I saw you mentioned me in the "**${guildName}**" server, but I can't reply in the #${channelName} channel. Try another channel or visit my support server!`,
        dm_generic: isPtBr ? 'Olá! Para ver meus comandos e funções, por favor me use em um servidor. É só me adicionar e digitar `/`!' : 'Hello! To see my commands and functions, please use me in a server. Just add me and type `/`!',
        no_embed_tip: isPtBr ? `\n\n<:linha:1393980037715333232> Me dê a permissão de \`Inserir Links\` para deixar tudo mais bonitinho!` : `\n\n<:linha:1393980037715333232> Give me the \`Embed Links\` permission to make everything look nicer!`,
        button_commands: isPtBr ? 'Ver comandos' : 'View Commands',
        button_website: isPtBr ? 'Site' : 'Website',
        button_support: isPtBr ? 'Suporte' : 'Support',
        button_tos_start: isPtBr ? 'Vamos lá!' : 'Let\'s go!',
    };
};

const createMentionButtons = (lang, authorId) => {
    const isPtBr = lang === 'pt_BR';
    const buttonLabels = {
        commands: isPtBr ? 'Ver comandos' : 'View Commands',
        website: isPtBr ? 'Site' : 'Website',
        support: isPtBr ? 'Suporte' : 'Support'
    };
    const commandsButton = new ButtonBuilder().setCustomId(`show_help_menu_${authorId}`).setLabel(buttonLabels.commands).setEmoji('<:informacao:1393822533454921869>').setStyle(ButtonStyle.Secondary);
    const websiteButton = new ButtonBuilder().setLabel(buttonLabels.website).setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/');
    const supportButton = new ButtonBuilder().setLabel(buttonLabels.support).setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc');
    const topggButton = new ButtonBuilder().setLabel('Top.gg').setEmoji('<:bot:1393821258851946606>').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/');
    return new ActionRowBuilder().addComponents(commandsButton, websiteButton, supportButton, topggButton);
};


module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        const lang = getLanguage(message);
        const texts = getLocalizedTexts(lang, message.guild?.name, message.channel?.name, client.user.username);

        if (!message.inGuild()) {
            return message.channel.send({ content: texts.dm_generic });
        }
        
        if (message.type === MessageType.Reply || !message.mentions.users.has(client.user.id)) {
            return;
        }

        const userData = getUser(message.author.id);
        const botPermissions = message.guild.members.me.permissionsIn(message.channel);
        
        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
             try {
                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel(texts.button_website).setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                    new ButtonBuilder().setLabel(texts.button_support).setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc')
                );
                await message.author.send({ content: texts.dm_cant_speak, components: [dmRow] });
            } catch (error) {
                console.log(`[menção] falha ao enviar dm para ${message.author.tag}.`);
            }
            return;
        }
        
        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);
        let responsePayload;

        if (userData.tosVersion < currentTosVersion) {
            const isFirstTime = userData.tosVersion === 0;
            const title = isFirstTime ? texts.tos_welcome_title : texts.tos_update_title;
            const description = isFirstTime ? texts.tos_welcome_desc : texts.tos_update_desc;
            const tosButtonRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`start_tos_${message.author.id}`).setLabel(texts.button_tos_start).setEmoji('<:carta:1394142002404135003>').setStyle(ButtonStyle.Secondary));
            
            responsePayload = { components: [tosButtonRow] };
            if (canSendEmbeds) {
                responsePayload.embeds = [await createEmbed(message, { title, description })];
            } else {
                responsePayload.content = `## ${title}\n${description}`;
            }
        } else {
            const displayName = message.member ? message.member.displayName : message.author.username;
            const title = texts.greeting.replace('${displayName}', displayName);
            const description = texts.description.replace('${botName}', "Binder's Server Tools");
            const row = createMentionButtons(lang, message.author.id);
            responsePayload = { components: [row] };

            if (canSendEmbeds) {
                responsePayload.embeds = [await createEmbed(message, { title, description })];
            } else {
                responsePayload.content = `## ${title}\n${description}${texts.no_embed_tip}`;
            }
        }
        
        if (canReadHistory) { await message.reply(responsePayload); } 
        else { await message.channel.send(responsePayload); }
    },
};