// src/utils/interactionLogger.js
const { WebhookClient, EmbedBuilder } = require('discord.js');

async function logInteraction(interaction) {
    if (!process.env.WEBHOOK_INTERACOES) return;
    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_INTERACOES });
        let commandString = 'N/A';

        if (interaction.isChatInputCommand()) {
            commandString = `/${interaction.commandName}`;
            if (interaction.options.getSubcommand(false)) {
                commandString += ` ${interaction.options.getSubcommand()}`;
            }
        } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            commandString = `Componente: ${interaction.customId}`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#6797BF')
            .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('Nova Interação Recebida')
            .addFields(
                { name: 'Comando', value: `\`${commandString}\`` },
                { name: 'Local', value: interaction.channel ? `<#${interaction.channel.id}>` : 'DM', inline: true },
                { name: 'Servidor', value: interaction.guild ? `${interaction.guild.name}` : 'DM', inline: true }
            )
            .setFooter({ text: `Client ID: ${interaction.client.user.id}` })
            .setTimestamp();
        
        await webhookClient.send({ username: 'Binder\'s Interactions', avatarURL: interaction.client.user.displayAvatarURL(), embeds: [embed] });
    } catch (error) {
        console.error('[interactionLogger] Falha ao enviar log de interação:', error.message);
    }
}

// A NOVA FUNÇÃO ESTÁ AQUI
async function logEval(interaction, code, output) {
    if (!process.env.WEBHOOK_INTERACOES) return;
    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_INTERACOES });

        const embed = new EmbedBuilder()
            .setColor('#FFD700') // cor dourada pra destacar
            .setAuthor({ name: `${interaction.user.tag} usou /developers eval`, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Input (Código)', value: `\`\`\`js\n${code.slice(0, 1000)}\n\`\`\`` },
                { name: 'Output (Resultado)', value: `\`\`\`js\n${output.slice(0, 1000)}\n\`\`\`` }
            )
            .setFooter({ text: `Executado em: ${interaction.guild ? interaction.guild.name : 'DM'}` })
            .setTimestamp();
        
        await webhookClient.send({ username: 'Binder\'s Eval Monitor', avatarURL: interaction.client.user.displayAvatarURL(), embeds: [embed] });
    } catch (error) {
        console.error('[interactionLogger] Falha ao enviar log de eval:', error.message);
    }
}

module.exports = { logInteraction, logEval };