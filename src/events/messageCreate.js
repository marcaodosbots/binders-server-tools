const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, MessageType } = require('discord.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const { getUser } = require('../../database/db.js');
const { currentTosVersion } = require('../config/config.js');

// listas de texto pra deixar a resposta mais dinamica
const greetings = {
    en_US: ['Hey, ${displayName}!', 'Hello, ${displayName}!', 'Hi there, ${displayName}!', 'Greetings, ${displayName}!', 'What\'s up, ${displayName}?', 'Good to see you, ${displayName}!', 'How can I help, ${displayName}?', 'At your service, ${displayName}!', 'You summoned me, ${displayName}?', 'Binder at your command, ${displayName}!'],
    pt_BR: ['<:mencao:1393999045248417924> E aí, ${displayName}!', '<:mencao:1393999045248417924> Fala tu, ${displayName}!', '<:mencao:1393999045248417924> Opa opa, ${displayName} chegou!', '<:mencao:1393999045248417924> Salve, ${displayName}!', '<:mencao:1393999045248417924> Como tamo, ${displayName}?', '<:mencao:1393999045248417924> Bom te ver por aqui, ${displayName}!', '<:mencao:1393999045248417924> Tudo certo por aí, ${displayName}?', '<:mencao:1393999045248417924> Chama que eu venho, ${displayName}!', '<:mencao:1393999045248417924> Tô na área, ${displayName}!', '<:mencao:1393999045248417924> Diz aí, ${displayName}! Tô pronto pro que der e vier.']
};
const descriptions = {
    en_US: ["I'm ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, here to provide utilities and make your server management easier. Use **'/'** to see what I can do!", "${botName} at your service <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>! I have a set of commands ready to help you out. Just type **'/'** to get started.", "Need a hand? I'm ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, equipped with commands to assist you. Explore them using **'/'**.", "You've reached ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. My purpose is to serve and assist. Check out my commands with **'/'**.", "This is ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. I'm ready to help! All my features are available through slash commands. Try typing **'/'**."],
    pt_BR: ["Eu sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> e tô aqui pra dar aquela força no seu servidor! Eu tenho utilidades e posso ser integrado em diferentes plataformas. Digita **'/'** e bora ver o que dá pra fazer.", "${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> na área ! Só escrever **'/'** aí e explorar os comandos. São vários, e são para diferentes públicos, ein!", "Se tá perdido, relaxa que eu te ajudo. Sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. Meu objetivo é ajudar você com meus comandos de utilidades! Dá um **'/'** aí e confere tudo que eu posso fazer.", "Como sempre, ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> por aqui. Minha equipe trabalha cada vez mais para ter mais comandos! Veja meus comandos com **'/'**.", "Sou o ${botName} e manjo quando o assunto é utilidades e ferramentas. Para ver o que eu posso fazer, só digitar **'/'** ou clicar no botão aqui em baixo!"]
};

// funções ajudantes pra criar os botoes, mais organizado
const createTosStartButton = (lang, authorId) => {
    const label = lang === 'pt_BR' ? 'Vamos lá!' : 'Let\'s go!';
    const button = new ButtonBuilder().setCustomId(`start_tos_${authorId}`).setLabel(label).setStyle(ButtonStyle.Secondary).setEmoji('<:carta:1394142002404135003>');
    return new ActionRowBuilder().addComponents(button);
};
const createMentionButtons = (lang, authorId) => {
    const isPtBr = lang === 'pt_BR';
    const buttonLabels = { commands: isPtBr ? 'Ver comandos' : 'View Commands', website: isPtBr ? 'Site' : 'Website', support: isPtBr ? 'Suporte' : 'Support' };
    const commandsButton = new ButtonBuilder().setCustomId(`show_help_menu_${authorId}`).setLabel(buttonLabels.commands).setStyle(ButtonStyle.Secondary).setEmoji('<:informacao:1393822533454921869>');
    const websiteButton = new ButtonBuilder().setLabel(buttonLabels.website).setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/').setEmoji('<:internet_:1393819535886258237>');
    const supportButton = new ButtonBuilder().setLabel(buttonLabels.support).setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc').setEmoji('<:support:1393820810434576434>');
    const topggButton = new ButtonBuilder().setLabel('Top.gg').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/').setEmoji('<:bot:1393821258851946606>');
    return new ActionRowBuilder().addComponents(commandsButton, websiteButton, supportButton, topggButton);
};


module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        // --- filtros iniciais ---
        if (message.author.bot) return;
        if (!message.inGuild()) return message.channel.send({ content: 'Opa! Pra usar meus comandos e funções, me chama num servidor, blz?' });
        if (message.type === MessageType.Reply || !message.mentions.users.has(client.user.id)) return;

        // --- setup principal ---
        const userData = getUser(message.author.id);
        const lang = getLanguage(message);
        const botPermissions = message.guild.members.me.permissionsIn(message.channel);

        // se n pode nem mandar msg, tenta o pv como ultimo recurso e vaza
        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
             try {
                const isPtBr = lang === 'pt_BR';
                const dmMessage = isPtBr ? `Oi! Vi que você me mencionou lá no servidor "**${message.guild.name}**", mas não consigo responder no canal #${message.channel.name}. Se precisar, me chama em outro canal ou cola no meu servidor de suporte!` : `Hello! I saw you mentioned me in the "**${message.guild.name}**" server, but I can't reply in the #${message.channel.name} channel. Try another channel or visit my support server!`;
                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel(isPtBr ? 'Site' : 'Website').setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                    new ButtonBuilder().setLabel(isPtBr ? 'Suporte' : 'Support').setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc')
                );
                await message.author.send({ content: dmMessage, components: [dmRow] });
            } catch (error) {
                console.log(`[menção] falha ao enviar dm para ${message.author.tag}.`);
            }
            return;
        }
        
        // --- montagem da resposta ---
        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);
        let responsePayload;

        // if/else pra decidir o conteudo do payload: ou é a tela de termos, ou é a resposta normal
        if (userData.tosVersion < currentTosVersion) {
            const isFirstTime = userData.tosVersion === 0;
            const isPtBr = lang === 'pt_BR';
            const title = isFirstTime ? (isPtBr ? `<:novato:1394085774567276614> Boas-vindas!` : `Welcome!`) : (isPtBr ? `<:anuncio:1394142606535033017> Termos Atualizados!` : `Terms Updated!`);
            const description = isFirstTime ? (isPtBr ? `Prazer em te conhecer, sou o ${client.user.username}! Para começarmos, preciso que você leia e aceite nossos Termos clicando no botão abaixo.` : `Nice to meet you, I'm ${client.user.username}! Please read and accept our Terms by clicking the button below.`) : (isPtBr ? `Olá! Nossos termos foram atualizados. Por favor, leia e aceite a nova versão para continuar.` : `Hello! Our terms have been updated. Please read and accept the new version to continue.`);
            const tosButtonRow = createTosStartButton(lang, message.author.id);
            
            responsePayload = { components: [tosButtonRow] };
            if (canSendEmbeds) {
                responsePayload.embeds = [await createEmbed(message, { title, description })];
            } else {
                responsePayload.content = `## ${title}\n${description}`;
            }
        } else {
            const showLangDisclaimer = userData.language === 'lang_auto';
            const displayName = message.member ? message.member.displayName : message.author.username;
            const title = greetings[lang][Math.floor(Math.random() * greetings[lang].length)].replace('${displayName}', displayName);
            const description = descriptions[lang][Math.floor(Math.random() * descriptions[lang].length)].replace('${botName}', "Binder's Server Tools");
            const row = createMentionButtons(lang, message.author.id);
            
            responsePayload = { components: [row] };

            if (canSendEmbeds) {
                const embed = await createEmbed(message, { title: title, description: description });
                if (showLangDisclaimer) {
                    const disclaimerText = `• ${lang === 'pt_BR' ? 'O Discord não informa seu idioma em menções. Respondi em Português por padrão.' : 'Discord doesn\'t share your language on mentions. I\'ve defaulted to English.'}`;
                    const originalFooter = embed.data.footer;
                    embed.setFooter({ text: `${originalFooter.text} ${disclaimerText}`, iconURL: originalFooter.icon_url });
                }
                responsePayload.embeds = [embed];
            } else {
                let content = `## ${title}\n${description}`;
                if (showLangDisclaimer) { content += lang === 'pt_BR' ? `\n\n-# O Discord não informa seu idioma em menções. Respondi em Português por padrão.` : `...`; }
                const noEmbedTip = lang === 'pt_BR' ? `\n\n<:linha:1393980037715333232> Me dê a permissão de \`Inserir Links\` para deixar tudo mais bonitinho!` : `...`;
                responsePayload.content = content + noEmbedTip;
            }
        }
        
        // --- envio final da resposta ---
        // um unico lugar pra enviar a resposta, seja reply ou send
        try {
            if (canReadHistory) { 
                await message.reply(responsePayload); 
            } else { 
                await message.channel.send(responsePayload); 
            }
        } catch (error) {
            console.error(`[messageCreate] erro final ao enviar resposta:`, error);
        }
    },
};