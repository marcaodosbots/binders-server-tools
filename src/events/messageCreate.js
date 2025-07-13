const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const createEmbed = require('../utils/createEmbed.js');

// Saudações na vibe Geração Z
const greetings = {
    pt_BR: [
        '<:mencao:1393999045248417924> E aí, ${displayName}!',
        '<:mencao:1393999045248417924> Fala tu, ${displayName}!',
        '<:mencao:1393999045248417924> Opa opa, ${displayName} chegou!',
        '<:mencao:1393999045248417924> Salve, ${displayName}!',
        '<:mencao:1393999045248417924> Como tamo, ${displayName}?',
        '<:mencao:1393999045248417924> Bom te ver por aqui, ${displayName}!',
        '<:mencao:1393999045248417924> Tudo certo por aí, ${displayName}?',
        '<:mencao:1393999045248417924> Chama que eu venho, ${displayName}!',
        '<:mencao:1393999045248417924> Tô na área, ${displayName}!',
        '<:mencao:1393999045248417924> Diz aí, ${displayName}! Tô pronto pro que der e vier.'
    ]
};

// Descrições atualizadas, com linguagem mais leve e atual
const descriptions = {
    pt_BR: [
        "Eu sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> e tô aqui pra dar aquela força no seu servidor! Eu tenho utilidades e posso ser integrado em diferentes plataformas. Digita **'/'** e bora ver o que dá pra fazer.",
        "${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> na área ! Só escrever **'/'** aí e explorar os comandos. São vários, e são para diferentes públicos, ein!",
        "Se tá perdido, relaxa que eu te ajudo. Sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>. Meu objetivo é ajudar você com meus comandos de utilidades! Dá um **'/'** aí e confere tudo que eu posso fazer.",
        "Como sempre, ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>  por aqui. Minha equipe trabalha cada vez mais para ter mais comandos! Veja meus comandos com **'/'**.",
        "Sou o ${botName} e manjo quando o assunto é utilidades e ferramentas. Para ver o que eu posso fazer, só digitar **'/'** ou clicar no botão aqui em baixo!",
        "Já sabe, sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> e tô cheio dos comandos úteis. Usa **'/'** e bora nessa descobrir o melhor que eu posso te oferecer.",
        "Pode deixar que eu cuido dos seus problemas.... ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> aqui, pronto pra tudo. Quer ver o que eu sei fazer? Manda um **'/'** ou clica no botão aqui embaixo.",
        "Tudo que tu precisa tá num botão de distância. Eu sou o ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, e eu quero deixar sua vida aqui mais fácil. Se precisar, só chamar!",
        "Tô aqui pra facilitar tua vida no Discord. ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> ativado, só usar **'/'** e aproveitar. Se quiser saber mais sobre mim, você pode clicar na minha foto e ver meu site e servidor de suporte!",
        "Cheio de ferramentas maneiras pra deixar o server top. ${botName} <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649> aqui, só digitar **'/'** e descobrir o que eu posso fazer!"
    ]
};

module.exports = {
    name: Events.MessageCreate,
    once: false,

    async execute(message, client) {
        if (message.author.bot || !message.mentions.has(client.user.id)) return;

        const lang = 'pt_BR';
        const isPtBr = true;

        const botPermissions = message.guild.members.me.permissionsIn(message.channel);

        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            try {
                const dmMessage = isPtBr
                    ? `Oi! Vi que você me mencionou lá no servidor "**${message.guild.name}**", mas não consigo responder no canal #${message.channel.name}. Se precisar, me chama em outro canal ou cola no meu servidor de suporte!`
                    : `Hello! I saw you mentioned me in the "**${message.guild.name}**" server, but I can't reply in the #${message.channel.name} channel. Try another channel or visit my support server!`;

                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel(isPtBr ? 'Site' : 'Website').setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                    new ButtonBuilder().setLabel(isPtBr ? 'Suporte' : 'Support').setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc')
                );

                await message.author.send({ content: dmMessage, components: [dmRow] });
            } catch (error) {
                console.log(`[Menção] Não consegui responder no canal #${message.channel.name} nem no PV de ${message.author.tag}.`);
            }
            return;
        }

        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);

        const displayName = message.member ? message.member.displayName : message.author.username;
        const randomGreetingTemplate = greetings[lang][Math.floor(Math.random() * greetings[lang].length)];
        const title = randomGreetingTemplate.replace('${displayName}', displayName);

        const botGlobalName = "Binder's Server Tools";
        const randomDescriptionTemplate = descriptions[lang][Math.floor(Math.random() * descriptions[lang].length)];
        const description = randomDescriptionTemplate.replace('${botName}', botGlobalName);

        const buttonLabels = {
            commands: isPtBr ? 'Ver comandos' : 'View Commands',
            website: isPtBr ? 'Site' : 'Website',
            support: isPtBr ? 'Suporte' : 'Support'
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('show_help_menu').setLabel(buttonLabels.commands).setEmoji('<:informacao:1393822533454921869>').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel(buttonLabels.website).setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
            new ButtonBuilder().setLabel(buttonLabels.support).setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc'),
            new ButtonBuilder().setLabel('Top.gg').setEmoji('<:bot:1393821258851946606>').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/')
        );

        let responsePayload = { components: [row] };

        if (canSendEmbeds) {
            const embed = await createEmbed(message, {
                title: title,
                description: description
            });
            responsePayload.embeds = [embed];
        } else {
            const noEmbedTip = isPtBr
                ? `\n-# <:linha:1393980037715333232> Me dê permissão de \`Inserir Links\` pra deixar tudo mais bonitinho!`
                : `\n-# <:linha:1393980037715333232> Give me \`Embed Links\` permission to make everything look nicer!`;
            responsePayload.content = `${title}\n${description}${noEmbedTip}`;
        }

        if (canReadHistory) {
            await message.reply(responsePayload);
        } else {
            await message.channel.send(responsePayload);
        }
    }
};
