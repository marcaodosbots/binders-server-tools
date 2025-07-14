const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');

// As listas de greetings e descriptions completas
const greetings = {
    en_US: ['Hey, ${displayName}!', 'Hello, ${displayName}!', 'Hi there, ${displayName}!', 'Greetings, ${displayName}!', 'What\'s up, ${displayName}?', 'Good to see you, ${displayName}!', 'How can I help, ${displayName}?', 'At your service, ${displayName}!', 'You summoned me, ${displayName}?', 'Binder at your command, ${displayName}!'],
    pt_BR: ['<:mencao:1393999045248417924> E aí, ${displayName}!', '<:mencao:1393999045248417924> Fala tu, ${displayName}!', '<:mencao:1393999045248417924> Opa opa, ${displayName} chegou!', '<:mencao:1393999045248417924> Salve, ${displayName}!', '<:mencao:1393999045248417924> Como tamo, ${displayName}?', '<:mencao:1393999045248417924> Bom te ver por aqui, ${displayName}!', '<:mencao:1393999045248417924> Tudo certo por aí, ${displayName}?', '<:mencao:1393999045248417924> Chama que eu venho, ${displayName}!', '<:mencao:1393999045248417924> Tô na área, ${displayName}!', '<:mencao:1393999045248417924> Diz aí, ${displayName}! Tô pronto pro que der e vier.']
};

const descriptions = {
    en_US: ["I'm ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, here to provide utilities and make your server management easier. Use **'/'** to see what I can do!", "${botName} at your service <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>! I have a set of commands ready to help you out. Just type **'/'** to get started.", "Need a hand? I'm ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, equipped with commands to assist you. Explore them using **'/'**.", "You've reached ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. My purpose is to serve and assist. Check out my commands with **'/'**.", "This is ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. I'm ready to help! All my features are available through slash commands. Try typing **'/'**."],
    pt_BR: ["Eu sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> e tô aqui pra dar aquela força no seu servidor! Eu tenho utilidades e posso ser integrado em diferentes plataformas. Digita **'/'** e bora ver o que dá pra fazer.", "${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> na área ! Só escrever **'/'** aí e explorar os comandos. São vários, e são para diferentes públicos, ein!", "Se tá perdido, relaxa que eu te ajudo. Sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. Meu objetivo é ajudar você com meus comandos de utilidades! Dá um **'/'** aí e confere tudo que eu posso fazer.", "Como sempre, ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>  por aqui. Minha equipe trabalha cada vez mais para ter mais comandos! Veja meus comandos com **'/'**.", "Sou o ${botName} e manjo quando o assunto é utilidades e ferramentas. Para ver o que eu posso fazer, só digitar **'/'** ou clicar no botão aqui em baixo!"]
};

// --- Mini-fábricas de botões (para resolver o problema de permissão de emoji) ---
const createTosStartButton = (lang, authorId, canUseEmojis) => {
    const label = lang === 'pt_BR' ? 'Vamos lá!' : 'Let\'s go!';
    const button = new ButtonBuilder().setCustomId(`start_tos_${authorId}`).setLabel(label).setStyle(ButtonStyle.Secondary);
    if (canUseEmojis) button.setEmoji('<:carta:1394142002404135003>');
    return new ActionRowBuilder().addComponents(button);
};
const createMentionButtons = (lang, authorId, canUseEmojis) => {
    const buttonLabels = {
        commands: lang === 'pt_BR' ? 'Ver comandos' : 'View Commands',
        website: lang === 'pt_BR' ? 'Site' : 'Website',
        support: lang === 'pt_BR' ? 'Suporte' : 'Support',
    };
    const commandsButton = new ButtonBuilder().setCustomId(`show_help_menu_${authorId}`).setLabel(buttonLabels.commands).setStyle(ButtonStyle.Secondary);
    const websiteButton = new ButtonBuilder().setLabel(buttonLabels.website).setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/');
    const supportButton = new ButtonBuilder().setLabel(buttonLabels.support).setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc');
    const topggButton = new ButtonBuilder().setLabel('Top.gg').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/');
    if (canUseEmojis) {
        commandsButton.setEmoji('<:informacao:1393822533454921869>');
        websiteButton.setEmoji('<:internet_:1393819535886258237>');
        supportButton.setEmoji('<:support:1393820810434576434>');
        topggButton.setEmoji('<:bot:1393821258851946606>');
    }
    return new ActionRowBuilder().addComponents(commandsButton, websiteButton, supportButton, topggButton);
};


module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        // --- LÓGICA DE DM (CORRIGIDO) ---
        if (!message.inGuild()) {
            if (message.mentions.has(client.user.id) || message.content.includes(client.user.id)) {
                return message.reply({ content: 'Olá! Eu funciono melhor em servidores. Por favor, me adicione a um e use meus comandos de barra `/` por lá!' });
            }
            return;
        }
        
        if (!message.mentions.has(client.user.id)) return;

        const userData = getUser(message.author.id);
        let lang = getLanguage(message);
        const showLangDisclaimer = userData.language === 'lang_auto';
        if (showLangDisclaimer) {
            lang = 'pt_BR';
        }
        const isPtBr = lang === 'pt_BR';
        
        const botPermissions = message.guild.members.me.permissionsIn(message.channel);
        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
             try {
                const dmMessage = isPtBr
                    ? `Oi! Vi que você me mencionou lá no servidor "**${message.guild.name}**", mas não consigo responder no canal #${message.channel.name}. Se precisar, me chama em outro canal ou cola no meu servidor de suporte!`
                    : `Hello! I saw you mentioned me in the "**${message.guild.name}**" server, but I can't reply in the #${message.channel.name} channel. Try another channel or visit my support server!`;
                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel(isPtBr ? 'Site' : 'Website').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                    new ButtonBuilder().setLabel(isPtBr ? 'Suporte' : 'Support').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc')
                );
                await message.author.send({ content: dmMessage, components: [dmRow] });
            } catch (error) {
                console.log(`[Menção] Não consegui responder no canal #${message.channel.name} nem no PV de ${message.author.tag}.`);
            }
            return;
        }
        
        const canUseEmojis = botPermissions.has(PermissionsBitField.Flags.UseExternalEmojis);
        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);
        
        // --- CHECA OS TERMOS ---
        if (userData.tosVersion < currentTosVersion) {
            const isFirstTime = userData.tosVersion === 0;
            const title = isFirstTime ? (isPtBr ? `<:novato:1394085774567276614> Boas-vindas!` : `<:novato:1394085774567276614> Welcome!`) : (isPtBr ? `<:anuncio:1394142606535033017> Termos Atualizados!` : `<:anuncio:1394142606535033017> Terms Updated!`);
            const description = isFirstTime ? (isPtBr ? `Prazer em te conhecer, sou o ${client.user.username}! Para começarmos, preciso que você leia e aceite nossos Termos clicando no botão abaixo.` : `Nice to meet you, I'm ${client.user.username}! To get started, please read and accept our Terms by clicking the button below.`) : (isPtBr ? `Olá! Nossos termos foram atualizados. Por favor, leia e aceite a nova versão para continuar.` : `Hello! Our terms have been updated. Please read and accept the new version to continue.`);
            
            const tosButtonRow = createTosStartButton(lang, message.author.id, canUseEmojis);
            let responsePayload = { components: [tosButtonRow] };

            if (canSendEmbeds) {
                const welcomeEmbed = await createEmbed(message, { title, description });
                responsePayload.embeds = [welcomeEmbed];
            } else {
                responsePayload.content = `## ${title}\n${description}`;
            }

            if (canReadHistory) { return message.reply(responsePayload); } 
            else { return message.channel.send(responsePayload); }
        }

        // --- RESPOSTA NORMAL (TERMOS OK) ---
        const displayName = message.member ? message.member.displayName : message.author.username;
        const title = greetings[lang][Math.floor(Math.random() * greetings[lang].length)].replace('${displayName}', displayName);
        const description = descriptions[lang][Math.floor(Math.random() * descriptions[lang].length)].replace('${botName}', "Binder's Server Tools");
        
        const row = createMentionButtons(lang, message.author.id, canUseEmojis);
        let responsePayload = { components: [row] };

        if (canSendEmbeds) {
            const embed = await createEmbed(message, { title: title, description: description });
            
            if (showLangDisclaimer) {
                const disclaimerText = `• ${isPtBr ? 'O Discord não informa seu idioma em menções. Respondi em Português por padrão.' : 'Discord doesn\'t share your language on mentions. I\'ve defaulted to English.'}`;
                const originalFooter = embed.data.footer;
                embed.setFooter({ 
                    text: `${originalFooter.text} ${disclaimerText}`,
                    iconURL: originalFooter.icon_url 
                });
            }
            responsePayload.embeds = [embed];
        } else {
            let content = `## ${title}\n${description}`;
            if (showLangDisclaimer) {
                content += isPtBr ? `\n\n• O Discord não informa seu idioma em menções. Respondi em Português por padrão.` : `\n\n• Discord doesn't share your language on mentions. I've defaulted to English.`;
            }
            const noEmbedTip = isPtBr ? `\n\n<:linha:1393980037715333232> Me dê a permissão de \`Inserir Links\` para deixar tudo mais bonitinho!` : `\n\n<:linha:1393980037715333232> Give me the \`Embed Links\` permission to make everything look nicer!`;
            responsePayload.content = content + noEmbedTip;
        }
        
        if (canReadHistory) { await message.reply(responsePayload); } 
        else { await message.channel.send(responsePayload); }
    },
};