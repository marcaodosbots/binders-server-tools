// src/utils/analyticsHandler.js
const { db, getUser, updateUser, getGuild, updateGuild, getAnalyticsValue, setAnalyticsValue, findGuildInteraction, insertGuildInteraction } = require('../../database/db.js');

async function trackInteraction(interaction) {
    if (interaction.user.bot) return;

    // AQUI A CORREÇÃO: a gente divide por 1000 pra converter de milisegundos para segundos
    const now = Math.floor(Date.now() / 1000);
    
    const userId = interaction.user.id;
    const guildId = interaction.inGuild() ? interaction.guild.id : 'DM';
    let commandString = 'N/A';

    if (interaction.isChatInputCommand()) {
        commandString = `/${interaction.commandName}`;
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommand) commandString += ` ${subcommand}`;
    } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
        commandString = `Componente: ${interaction.customId.split('_')[0]}`;
    }

    // --- Atualiza dados do Usuário ---
    const userData = getUser(userId);
    if (!userData.firstInteraction) updateUser(userId, 'firstInteraction', now);
    updateUser(userId, 'lastInteraction', now);
    updateUser(userId, 'interactionCount', (userData.interactionCount || 0) + 1);
    
    const userLastCommands = userData.last10Commands ? JSON.parse(userData.last10Commands) : [];
    userLastCommands.unshift({ name: commandString, at: now, guild: guildId });
    if (userLastCommands.length > 10) userLastCommands.pop();
    updateUser(userId, 'last10Commands', JSON.stringify(userLastCommands, null, 2));

    // --- Atualiza dados do Servidor (só se for em um) ---
    if (interaction.inGuild()) {
        const guildData = getGuild(interaction.guild);
        
        // esses dois contadores são para o usuário DENTRO do servidor
        updateUser(userId, 'commandCount', (userData.commandCount || 0) + 1);
        if (interaction.isChatInputCommand()) {
            updateGuild(guildId, 'commandsRun', (guildData.commandsRun || 0) + 1);
        }
        updateGuild(guildId, 'interactionsRun', (guildData.interactionsRun || 0) + 1);
        
        const guildLastInteractions = guildData.lastInteractions ? JSON.parse(guildData.lastInteractions) : [];
        guildLastInteractions.unshift({ name: commandString, at: now, user: userId });
        if (guildLastInteractions.length > 10) guildLastInteractions.pop();
        updateGuild(guildId, 'lastInteractions', JSON.stringify(guildLastInteractions, null, 2));
        
        const hasInteractedBefore = findGuildInteraction.get(guildId, userId);
        if (!hasInteractedBefore) {
            insertGuildInteraction.run(guildId, userId);
            updateGuild(guildId, 'interactionUsers', (guildData.interactionUsers || 0) + 1);
        }
    }

    // --- Atualiza dados Globais ---
    const currentMapRaw = getAnalyticsValue.get('commandUsageMap')?.value || '{}';
    const commandMap = JSON.parse(currentMapRaw);
    commandMap[commandString] = (commandMap[commandString] || 0) + 1;
    setAnalyticsValue.run('commandUsageMap', JSON.stringify(commandMap, null, 2));
}

module.exports = { trackInteraction };