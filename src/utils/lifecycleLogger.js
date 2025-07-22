const { WebhookClient, EmbedBuilder } = require('discord.js');

function sendLifecycleLog(title, color) {
    if (!process.env.WEBHOOK_UPDATES_PV) return;

    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_UPDATES_PV });
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setTimestamp();
        
        webhookClient.send({
            username: 'Binder\'s Status',
            embeds: [embed],
        });
    } catch (error) {
        console.error('[Lifecycle] Falha ao enviar log de status:', error.message);
    }
}

module.exports = { sendLifecycleLog };