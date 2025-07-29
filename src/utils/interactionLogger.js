// src/utils/interactionLogger.js
const { WebhookClient, EmbedBuilder } = require('discord.js');

async function logInteraction(interaction) {
    // se o webhook n estiver configurado, a gente so ignora
    if (!process.env.WEBHOOK_INTERACOES) return;

    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_INTERACOES });
        let commandString = 'N/A';

        // monta o nome completo do comando (ex: /binder info)
        if (interaction.isChatInputCommand()) {
            commandString = `/${interaction.commandName}`;
            if (interaction.options.getSubcommand(false)) {
                commandString += ` ${interaction.options.getSubcommand()}`;
            }
        } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            commandString = `Componente: ${interaction.customId}`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#6797BF') // a cor que vc pediu
            .setAuthor({
                name: `${interaction.user.tag} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Nova Interação Recebida')
            .addFields(
                { name: 'Tipo', value: interaction.type.toString(), inline: true },
                { name: 'Comando', value: `\`${commandString}\``, inline: true }
            )
            .setFooter({
                text: interaction.guild ? interaction.guild.name : 'DM / App de Usuário',
                iconURL: interaction.guild ? interaction.guild.iconURL() : client.user.displayAvatarURL(),
            })
            .setTimestamp();
        
        // se a interação foi num canal, adiciona o link
        if (interaction.channel) {
            embed.addFields({ name: 'Local', value: `<#${interaction.channel.id}>` });
        }

        await webhookClient.send({
            username: 'Binder\'s Interactions',
            avatarURL: interaction.client.user.displayAvatarURL(),
            embeds: [embed],
        });

    } catch (error) {
        console.error('[interactionLogger] Falha ao enviar log de interação:', error.message);
    }
}

module.exports = { logInteraction };