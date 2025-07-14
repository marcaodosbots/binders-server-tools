const { EmbedBuilder } = require('discord.js');

// nossa 'fábrica' de embeds, agora com a lógica corrigida
async function createEmbed(context, options = {}) {
    
    const defaultConfig = {
        color: '#9F9AAF',
    };

    const embedConfig = { ...defaultConfig, ...options };

    // --- Lógica para descobrir quem é o usuário e o cliente ---
    // AQUI ESTAVA O BUG. agora está corrigido.
    // a fonte do usuario é o 'context.user' OU o 'context.author'
    const userSource = context.user || context.author;
    const clientUser = context.client.user;

    const targetUser = options.targetUser || userSource;
    
    const member = await context.guild.members.fetch(targetUser.id).catch(() => null);
    const displayName = member ? member.displayName : targetUser.username;

    const embed = new EmbedBuilder()
        .setColor(embedConfig.color)
        .setAuthor({
            name: `${displayName} | @${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        })
        .setFooter({
            text: `${context.guild.name} - ${clientUser.displayName}`,
            iconURL: context.guild.iconURL(),
        })
        .setTimestamp();
    
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