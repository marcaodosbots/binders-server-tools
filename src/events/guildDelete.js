const { Events } = require('discord.js');
const { updateGuild } = require('../../database/db.js');
const { logGuildLeave } = require('../utils/joinLeaveLogger.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild, client) {
        console.log(`[Guild] Saí do servidor: ${guild.name} (ID: ${guild.id})`);
        
        updateGuild(guild.id, 'inGuild', 0);

        await logGuildLeave(guild, client);
    },
};