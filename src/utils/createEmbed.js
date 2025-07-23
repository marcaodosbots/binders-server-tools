const { EmbedBuilder } = require('discord.js');

// config base pra todos os embeds
const defaultConfig = {
    color: '#9F9AAF',
};

async function createEmbed(context, options = {}) {
    // junta o nosso padrão com as opções q o comando mandou
    const embedConfig = { ...defaultConfig, ...options };
    
    // descobre quem é o user da interação/msg
    const userSource = context.user || context.author;
    const clientUser = context.client.user;
    const targetUser = options.targetUser || userSource;

    const embed = new EmbedBuilder()
        .setColor(embedConfig.color)
        .setTimestamp();

    // logica de contexto pra montar o embed certo em server, dm ou app de usuário
    if (context.guild) {
        // se a interação tiver as infos do servidor, monta o embed completo
        const member = await context.guild.members.fetch(targetUser.id).catch(() => null);
        const displayName = member ? member.displayName : targetUser.username;

        embed.setAuthor({
            name: `${displayName} | @${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: `${context.guild.name} - ${clientUser.displayName}`,
            iconURL: context.guild.iconURL({ dynamic: true }),
        });
    } else {
        // se não tiver (é dm ou comando de app), monta um embed mais simples
        embed.setAuthor({
            name: targetUser.tag,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: clientUser.displayName,
            iconURL: clientUser.displayAvatarURL(),
        });
    }
    
    // partes opcionais do embed, só adiciona se o comando mandar
    if (options.title) {
        embed.setTitle(options.title);
    }
    if (options.description) {
        embed.setDescription(options.description);
    }
    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }
    if (options.fields) {
        embed.addFields(options.fields);
    }

    return embed;
}

module.exports = createEmbed;