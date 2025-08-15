const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { getGuild, updateGuild } = require('../../database/db.js');
const createEmbed = require('../utils/createEmbed.js');
const { logGuildJoin } = require('../utils/joinLeaveLogger.js');

const getLocalizedTexts = (lang, inviter) => {
    const isPtBr = lang === 'pt_BR';
    const inviterTag = inviter ? inviter.tag : (isPtBr ? 'alguém' : 'someone');
    const welcomeEmoji = '<:novato:1394085774567276614>';

    return {
        dm_title: isPtBr ? `${welcomeEmoji} Obrigado por me adicionar!` : `${welcomeEmoji} Thanks for adding me!`,
        dm_description: isPtBr ? `Olá, **${inviter?.username}**!\n\nMuito obrigado por adicionar o **Binder's Server Tools**. Para começar, digite \`/\` em qualquer canal para ver os comandos. Se precisar de ajuda, entre no nosso [servidor de suporte](https://dsc.gg/bindersdc)!` : `Hello, **${inviter?.username}**!\n\nThank you for adding **Binder's Server Tools**. To get started, type \`/\` in any channel to see the commands. If you need help, join our [support server](https://dsc.gg/bindersdc)!`,
        channel_title: isPtBr ? `${welcomeEmoji} Obrigado pelo convite!` : `${welcomeEmoji} Thanks for the invite!`,
        channel_description: isPtBr ? `Olá a todos! Fui adicionado por **${inviterTag}**. Estou pronto para ajudar! Usem \`/\` para explorar meus comandos.` : `Hello everyone! I was added by **${inviterTag}**. I'm ready to help! Use \`/\` to explore my commands.`,
        generic_title: isPtBr ? `${welcomeEmoji} Olá, novo servidor!` : `${welcomeEmoji} Hello, new server!`,
        generic_description: isPtBr ? `Fui adicionado e estou pronto para ajudar! Use \`/\` para ver meus comandos. Um admin pode usar \`/configurar\` para ajustar minhas funções.` : `I've been added and I'm ready to help! Use \`/\` to see my commands. An admin can use \`/configure\` to adjust my features.`
    };
};

const findChannelToSend = (guild, client) => {
    if (guild.systemChannel && guild.systemChannel.permissionsFor(client.user).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return guild.systemChannel;
    return guild.channels.cache
        .filter(c => c.type === 0 && c.permissionsFor(client.user).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]))
        .sort((a, b) => a.position - b.position)
        .first();
};

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, client) {
        console.log(`[guild] entrei em: ${guild.name} (${guild.id})`);
        
        getGuild(guild, 'guildCreate');

        let inviter = null;
        try {
            if (guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
                const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
                inviter = auditLogs.entries.first()?.executor;
            }
        } catch (e) { console.error('[guildCreate] falha ao buscar log de auditoria.'); }

        let permaInvite = null;
        try {
            const channel = findChannelToSend(guild, client);
            if (channel && channel.permissionsFor(client.user).has(PermissionsBitField.Flags.CreateInstantInvite)) {
                const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, reason: 'Convite permanente para o desenvolvedor' });
                permaInvite = invite.url;
                updateGuild(guild.id, 'permaInvite', permaInvite);
            }
        } catch (e) { console.error(`[guildCreate] falha ao criar convite para ${guild.name}.`); }

        await logGuildJoin(guild, inviter, permaInvite);
        
        const lang = guild.preferredLocale === 'pt-BR' ? 'pt_BR' : 'en_US';
        const texts = getLocalizedTexts(lang, inviter);

        if (inviter) {
            const thankYouEmbed = await createEmbed({ guild, client, user: inviter }, { title: texts.dm_title, description: texts.dm_description });
            try {
                await inviter.send({ embeds: [thankYouEmbed] });
                return;
            } catch (error) {
                console.log(`[guildCreate] dm pra ${inviter.tag} fechada, tentando canal publico...`);
            }
        }
        
        const channelToSend = findChannelToSend(guild, client);
        if (!channelToSend) {
            return console.log('[guildCreate] n achei canal pra mandar msg de boas-vindas.');
        }

        const title = inviter ? texts.channel_title : texts.generic_title;
        const description = inviter ? texts.channel_description : texts.generic_description;
        const publicEmbed = await createEmbed({ guild, client, user: client.user }, { title, description });
        
        await channelToSend.send({ embeds: [publicEmbed] });
    },
};