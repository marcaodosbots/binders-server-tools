// src/utils/logHandler.js
const { WebhookClient, EmbedBuilder } = require('discord.js');

async function logErrorToWebhook(interaction, error) {
    if (!process.env.WEBHOOK_ERROS) {
        return console.error('[logHandler] WEBHOOK_ERROS não configurado no .env. O erro não será enviado.');
    }

    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROS });

        const errorType = error ? 'Erro de Execução' : 'Comando/Interação Não Encontrada';
        
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Relatório de Erro: ${errorType}`)
            .setColor('Red')
            .addFields(
                { name: 'Usuário', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
                { name: 'Comando/ID', value: `\`${interaction.commandName || interaction.customId}\``, inline: true },
                { name: 'Canal', value: interaction.channel ? `${interaction.channel.name} (\`${interaction.channel.id}\`)` : 'DM', inline: true },
                { name: 'Servidor', value: interaction.guild ? `${interaction.guild.name} (\`${interaction.guild.id}\`)` : 'DM', inline: true }
            )
            .setTimestamp();

        if (error) {
            embed.setDescription(`\`\`\`js\n${error.stack.slice(0, 4000)}\n\`\`\``);
        }

        await webhookClient.send({
            username: 'Binder\'s Logs',
            avatarURL: interaction.client.user.displayAvatarURL(),
            embeds: [embed],
        });

    } catch (webhookError) {
        console.error('[logHandler] Falha CRÍTICA ao enviar o log para o webhook:', webhookError);
    }
}

module.exports = { logErrorToWebhook };