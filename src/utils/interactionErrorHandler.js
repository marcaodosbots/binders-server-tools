const { MessageFlags, WebhookClient, EmbedBuilder } = require('discord.js');
const getLanguage = require('./getLanguage.js');
const createEmbed = require('./createEmbed.js');
const { getGuild } = require('../../database/db.js');

// central de textos para a resposta de erro ao usuário
const texts = {
    title: {
        'pt_BR': '<:x_:1394185776807546963> Opa, algo deu errado!',
        'en_US': '<:x_:1394185776807546963> Oops, something went wrong!',
    },
    description: {
        'pt_BR': 'Não consegui processar sua solicitação. Pode ser um comando que não existe ou um erro interno.\n\nSe o problema continuar, por favor, entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e nos avise!',
        'en_US': 'I couldn\'t process your request. It might be a command that doesn\'t exist or an internal error.\n\nIf the problem persists, please join our [support server](https://discord.gg/Y2jJadbUmY) and let us know!',
    }
};

// função que manda o log detalhado pro webhook de erros
async function logErrorToWebhook(interaction, error) {
    if (!process.env.WEBHOOK_ERROS) {
        return console.error('[logHandler] WEBHOOK_ERROS não configurado no .env.');
    }
    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROS });
        const errorType = error ? 'Erro de Execução' : 'Comando/Interação Não Encontrada';
        
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Relatório de Erro: ${errorType}`)
            .setColor('Red')
            .setTimestamp();
            
        if (interaction.guild) {
            const guildData = getGuild(interaction.guild);
            embed.addFields(
                { name: 'Usuário', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
                { name: 'Comando/ID', value: `\`${interaction.commandName || interaction.customId}\``, inline: true },
                { name: 'Canal', value: `<#${interaction.channel.id}> (\`${interaction.channel.id}\`)`, inline: true },
                { name: 'Servidor', value: `${interaction.guild.name} (\`${interaction.guild.id}\`)`, inline: true },
                { name: 'Convite', value: guildData.permaInvite || 'Nenhum salvo.' }
            );
        } else {
            embed.addFields({ name: 'Usuário', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true });
        }

        if (error) {
            embed.setDescription(`\`\`\`js\n${error.stack.slice(0, 4000)}\n\`\`\``);
        }

        await webhookClient.send({ username: 'Binder\'s Logs', avatarURL: interaction.client.user.displayAvatarURL(), embeds: [embed] });
    } catch (webhookError) {
        console.error('[logHandler] Falha CRÍTICA ao enviar o log para o webhook:', webhookError);
    }
}

module.exports = {
    // essa é a função principal que o roteador chama
    async execute(interaction, error) {
        // primeiro, manda o relatório detalhado pro nosso canal de logs
        await logErrorToWebhook(interaction, error);
        
        // depois, manda a resposta amigável e simples pro usuário
        const lang = getLanguage(interaction);
        const errorEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: texts.description[lang],
        });

        // checagem de segurança pra evitar crash de 'interaction has already been replied'
        if (interaction.deferred || interaction.replied) {
            return interaction.followUp({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }
        return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
    },
};