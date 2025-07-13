const { EmbedBuilder } = require('discord.js');

// nossa 'fábrica' de embeds, agora mais inteligente
// 'context' pode ser tanto uma 'interaction' quanto uma 'message'
async function createEmbed(context, options = {}) {
    
    // os valores padrao agora moram aqui dentro
    const defaultConfig = {
        color: '#9F9AAF',
    };

    const embedConfig = { ...defaultConfig, ...options };

    // --- Lógica para descobrir quem é o usuário e o cliente ---
    const userSource = context.user ? context : context.author;
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
        // AQUI A MUDANÇA QUE VOCÊ PEDIU
        .setFooter({
            text: `${context.guild.name} - ${clientUser.displayName}`,
            iconURL: context.guild.iconURL(), // pega o icone do servidor dinamicamente
        })
        .setTimestamp(); // o timestamp continua aqui
    
    // a gente só adiciona as outras partes se elas forem passadas nas 'options'
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