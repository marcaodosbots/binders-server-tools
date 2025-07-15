const { EmbedBuilder } = require('discord.js');

// config base pra todos os embeds, fora da função pra não ficar recriando toda hora
const defaultConfig = {
    color: '#9F9AAF',
};

async function createEmbed(context, options = {}) {
    // junta o nosso padrão com as opções q o comando mandou
    const embedConfig = { ...defaultConfig, ...options };
    
    // descobre quem é o user da interação/msg
    const userSource = context.user || context.author;
    const clientUser = context.client.user;
    
    // o 'alvo' do embed (pra comandos de userinfo, etc) ou o proprio autor
    const targetUser = options.targetUser || userSource;

    const embed = new EmbedBuilder()
        .setColor(embedConfig.color)
        .setTimestamp();

    // --- Lógica de Contexto (Servidor vs. DM) ---
    if (context.inGuild()) {
        // se a interação for num servidor, monta o embed completo
        const member = await context.guild.members.fetch(targetUser.id).catch(() => null);
        const displayName = member ? member.displayName : targetUser.username;

        embed.setAuthor({
            name: `${displayName} | @${targetUser.tag}`,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: `${context.guild.name} - ${clientUser.displayName}`,
            iconURL: context.guild.iconURL({ dynamic: true }), // dynamic: true pra pegar .gif
        });
    } else {
        // se for numa dm, monta um embed mais simples
        embed.setAuthor({
            name: targetUser.tag,
            iconURL: targetUser.displayAvatarURL(),
        });
        embed.setFooter({
            text: clientUser.displayName,
            iconURL: clientUser.displayAvatarURL(),
        });
    }
    
    // --- Partes Opcionais ---
    // só adiciona se a opção for passada pelo comando
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