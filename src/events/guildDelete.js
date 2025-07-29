const { Events } = require('discord.js');
const { updateGuild } = require('../../database/db.js');
const { logGuildLeave } = require('../utils/joinLeaveLogger.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild, client) {
        console.log(`[Guild] Saí do servidor: ${guild.name} (ID: ${guild.id})`);
        
        // atualiza o status no banco de dados para inGuild = 0 (false)
        updateGuild(guild.id, 'inGuild', 0);
        
        // chama nosso novo fiscal pra avisar no webhook com as infos da db
        await logGuildLeave(guild, client);
    },
};