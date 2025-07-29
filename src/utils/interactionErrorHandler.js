// src/utils/interactionErrorHandler.js
const { MessageFlags, WebhookClient, EmbedBuilder } = require('discord.js');
const getLanguage = require('./getLanguage.js');
const createEmbed = require('./createEmbed.js');
const { getGuild } = require('../../database/db.js');

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

const texts = { /* ... objeto de textos continua o mesmo ... */ };

module.exports = {
    async execute(interaction, error) {
        await logErrorToWebhook(interaction, error);
        
        const lang = getLanguage(interaction);
        const errorEmbed = await createEmbed(interaction, {
            title: texts.title[lang],
            description: texts.description[lang],
        });

        if (interaction.deferred || interaction.replied) {
            return interaction.followUp({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }
        return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
    },
};