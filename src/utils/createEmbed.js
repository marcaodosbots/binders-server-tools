const { EmbedBuilder } = require('discord.js');

// nossa 'fábrica' de embeds, agora mais inteligente
// 'context' pode ser tanto uma 'interaction' quanto uma 'message'
async function createEmbed(context, options = {}) {
    
    // os valores padrao agora moram aqui dentro
    const defaultConfig = {
        color: '#9F9AAF',
        footer: {
            text: 'Binder\'s Server Tools',
        },
    };

    const embedConfig = { ...defaultConfig, ...options };

    // --- Lógica para descobrir quem é o usuário e o cliente ---
    // se o context tem a propriedade 'user', é uma interaction. se nao, é uma message.
    const userSource = context.user ? context : context.author;
    const clientUser = context.client.user;

    // por padrão, o autor do embed é quem iniciou o contexto
    // mas se o comando passar um 'targetUser', a gente usa ele
    const targetUser = options.targetUser || userSource;
    
    // a gente precisa pegar o 'member' pra conseguir o apelido do usuário no servidor
    const member = await context.guild.members.fetch(targetUser.id).catch(() => null);
    const displayName = member ? member.displayName : targetUser.username;

    const embed = new EmbedBuilder()
        .setColor(embedConfig.color)
        .setAuthor({
            name: `${displayName} | @${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        })
        .setFooter({
            text: `${embedConfig.footer.text} - @${userSource.tag}`,
            // pega a foto do proprio bot dinamicamente
            iconURL: clientUser.displayAvatarURL(), 
        })
        .setTimestamp();
    
    // a gente só adiciona as outras partes se elas forem passadas nas 'options'
    if (embedConfig.title) {
        embed.setTitle(embedConfig.title);
    }
    if (embedConfig.description) {
        embed.setDescription(embedConfig.description);
    }
    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    return embed;
}

module.exports = createEmbed;