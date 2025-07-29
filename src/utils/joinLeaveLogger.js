// src/utils/joinLeaveLogger.js
const { WebhookClient, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuild, updateGuild } = require('../../database/db.js');

async function logGuildJoin(guild, inviter, inviteURL) {
    if (!process.env.WEBHOOK_JOINS) return;
    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_JOINS });
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setTitle(`✅ Bot Adicionado a um Novo Servidor!`)
            .setColor('Green')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Servidor', value: `${guild.name}\n(\`${guild.id}\`)`, inline: true },
                { name: 'Dono', value: `${owner.user.tag}\n(\`${owner.id}\`)`, inline: true },
                { name: 'Membros', value: guild.memberCount.toString(), inline: true },
                { name: 'Adicionado por', value: inviter ? `${inviter.tag}\n(\`${inviter.id}\`)` : 'Não identificado', inline: true },
                { name: 'Convite Criado', value: inviteURL || 'Não foi possível criar.' }
            )
            .setTimestamp();
        await webhookClient.send({ username: 'Binder\'s Guild Monitor', avatarURL: guild.client.user.displayAvatarURL(), embeds: [embed] });
    } catch (error) {
        console.error('[JoinLogger] Falha ao enviar log de entrada:', error.message);
    }
}

async function logGuildLeave(guild, client) {
    if (!process.env.WEBHOOK_JOINS) return;

    try {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_JOINS });
        const owner = await guild.fetchOwner().catch(() => ({ user: { tag: 'Desconhecido' } }));
        const guildData = getGuild(guild);
        let inviteURL = guildData.permaInvite;

        // --- LÓGICA DE VERIFICAÇÃO DE CONVITE ---
        if (inviteURL) {
            try {
                // tenta 'puxar' as infos do convite pra ver se ele ainda é válido
                await client.fetchInvite(inviteURL);
                console.log(`[LeaveLogger] Convite para ${guild.name} ainda é válido.`);
            } catch (error) {
                // se deu erro, o convite provavelmente expirou ou foi deletado
                console.log(`[LeaveLogger] Convite para ${guild.name} expirou. Tentando criar um novo...`);
                inviteURL = null; // reseta o convite pra gente tentar criar outro
            }
        }
        
        // se a gente não tem um convite válido, tenta criar um novo
        if (!inviteURL) {
            try {
                const channel = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(client.user).has(PermissionsBitField.Flags.CreateInstantInvite));
                if (channel) {
                    const newInvite = await channel.createInvite({ maxAge: 0, maxUses: 0, reason: 'Atualizando convite permanente para o desenvolvedor' });
                    inviteURL = newInvite.url;
                    updateGuild(guild.id, 'permaInvite', inviteURL); // atualiza no db
                    console.log(`[LeaveLogger] Novo convite criado e salvo para ${guild.name}.`);
                }
            } catch (e) { console.error(`[LeaveLogger] Falha ao criar novo convite para ${guild.name}.`); }
        }
        // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

        const embed = new EmbedBuilder()
            .setTitle(`❌ Bot Removido de um Servidor`)
            .setColor('Red')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription('Abaixo estão os últimos dados registrados para este servidor no nosso banco de dados.')
            .addFields(
                { name: 'Servidor', value: `${guild.name}\n(\`${guild.id}\`)`, inline: true },
                { name: 'Dono', value: `${owner.user.tag}`, inline: true },
                { name: 'Membros na Saída', value: guild.memberCount.toString(), inline: true },
                { name: 'Comandos Usados', value: (guildData.commandsRun || 0).toString(), inline: true },
                { name: 'Usuários Únicos', value: (guildData.interactionUsers || 0).toString(), inline: true },
                { name: 'Região', value: guildData.serverRegion || 'N/A', inline: true },
                { name: 'Convite', value: inviteURL || 'Nenhum disponível.' }
            )
            .setTimestamp();
        
        await webhookClient.send({ username: 'Binder\'s Guild Monitor', avatarURL: client.user.displayAvatarURL(), embeds: [embed] });
    } catch (error) {
        console.error('[LeaveLogger] Falha ao enviar log de saída:', error.message);
    }
}

module.exports = { logGuildJoin, logGuildLeave };