const { EmbedBuilder } = require('discord.js');

async function createEmbed(context, options = {}) {
    const defaultConfig = {
        color: '#9F9AAF',
    };
    const embedConfig = { ...defaultConfig, ...options };

    const userSource = context.user || context.author;
    const clientUser = context.client.user;
    const targetUser = options.targetUser || userSource;

    const embed = new EmbedBuilder().setColor(embedConfig.color);

    // --- Lógica de Contexto (Servidor vs. DM) ---
    const isInGuild = context.inGuild();

    if (isInGuild) {
        // se a interação for num servidor, monta o embed completo
        const member = await context.guild.members.fetch(targetUser.id).catch(() => null);
        const displayName = member ? member.displayName : targetUser.username;

        embed.setAuthor({
            name: `${displayName} | @${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: `${context.guild.name} - ${clientUser.displayName}`,
            iconURL: context.guild.iconURL(),
        });

    } else {
        // se for numa dm, monta um embed mais simples
        embed.setAuthor({
            name: `${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: clientUser.displayName,
            iconURL: clientUser.displayAvatarURL(),
        });
    }

    embed.setTimestamp();
    
    // Partes opcionais
    if (options.title) {
        embed.setTitle(options.title);
    }
    if (options.description) {
        embed.setDescription(options.description);
    }
    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    return embed;
}

module.exports = createEmbed;