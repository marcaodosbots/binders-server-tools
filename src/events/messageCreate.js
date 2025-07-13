const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder } = require('discord.js');

// a lista de saudações com o placeholder pro nome.
// o código vai trocar '${displayName}' pelo nome/apelido do usuário.
const greetings = [
    'Hey, ${displayName}!',
    'Hello, ${displayName}!',
    'Hi there, ${displayName}!',
    'Greetings, ${displayName}!',
    'What\'s up, ${displayName}?',
    'Good to see you, ${displayName}!',
    'How can I help, ${displayName}?',
    'At your service, ${displayName}!',
    'You summoned me, ${displayName}?',
    'Binder at your command, ${displayName}!'
];

module.exports = {
    name: Events.MessageCreate,
    once: false,
    
    async execute(message, client) {
         console.log(`Mensagem recebida de ${message.author.tag}. Menções na mensagem:`, message.mentions.users.map(u => u.tag));

        if (message.author.bot || !message.mentions.has(client.user.id)) {
            return;
        }

        const botPermissions = message.guild.members.me.permissionsIn(message.channel);

        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            try {
                const dmMessage = `Hello! I saw you mentioned me in the **${message.guild.name}** server, but I don't have permission to speak in the #${message.channel.name} channel. If you need help, feel free to use my commands in another channel or join my support server!`;
                
                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Website').setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                    new ButtonBuilder().setLabel('Support').setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc')
                );
                
                await message.author.send({ content: dmMessage, components: [dmRow] });
            } catch (error) {
                console.log(`[Menção] Não consegui responder no canal #${message.channel.name} nem no PV de ${message.author.tag}.`);
            }
            return;
        }
        
        const canSendEmbeds = botPermissions.has(PermissionsBitField.Flags.EmbedLinks);
        const canReadHistory = botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory);

        // --- CONSTRUÇÃO DA MENSAGEM ---

        // pega o apelido do usuário no servidor, ou o nome global se n tiver
        const displayName = message.member ? message.member.displayName : message.author.username;
        
        // pega uma saudação aleatória e substitui o placeholder pelo nome certo
        const randomGreetingTemplate = greetings[Math.floor(Math.random() * greetings.length)];
        const title = randomGreetingTemplate.replace('${displayName}', displayName);
        
        const description = "I'm Binder's Server Tools <:verified_app_1:1336358365479305366><:verified_app_2:1336358433946861649>, here to help you and provide utilities for your server. To use my commands, just type **'/'** (:slash_commands:) and look for the desired command.";

        // --- BOTÕES ATUALIZADOS ---
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('show_help_menu')
                    .setLabel('View My Commands')
                    .setEmoji('<:informacao:1393822533454921869>')
                    .setStyle(ButtonStyle.Secondary), // cinza
                
                new ButtonBuilder().setLabel('Website').setEmoji('<:internet_:1393819535886258237>').setStyle(ButtonStyle.Link).setURL('https://binders.carrd.co/'),
                new ButtonBuilder().setLabel('Support').setEmoji('<:support:1393820810434576434>').setStyle(ButtonStyle.Link).setURL('https://dsc.gg/bindersdc'),
                new ButtonBuilder().setLabel('Top.gg').setEmoji('<:bot:1393821258851946606>').setStyle(ButtonStyle.Link).setURL('https://top.gg/bot/1310336375261892608/'),
            );

        let responsePayload = { components: [row] };

        if (canSendEmbeds) {
            const embed = new EmbedBuilder()
                .setColor('#9F9AAF')
                .setTitle(title)
                .setDescription(description)
                .setFooter({ text: `Mentioned by @${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            responsePayload.embeds = [embed];
        } else {
            responsePayload.content = `${title}\n${description}`;
        }
        
        if (canReadHistory) {
            await message.reply(responsePayload);
        } else {
            await message.channel.send(responsePayload);
        }
    },
};