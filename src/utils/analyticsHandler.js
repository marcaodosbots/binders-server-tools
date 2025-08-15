// src/utils/analyticsHandler.js
const { db, getUser, updateUser, getGuild, updateGuild, getAnalyticsValue, setAnalyticsValue, findGuildInteraction, insertGuildInteraction } = require('../../database/db.js');

// --- LÓGICA DE STREAK COM FUSO HORÁRIO CORRETO ---
function handleStreak(userData) {
    const userId = userData.userId;
    const lastInteractionTimestamp = userData.lastInteraction;

    // se o usuário nunca interagiu, não tem o que fazer
    if (!lastInteractionTimestamp) return;

    // cria um formatador de data que FORÇA o fuso horário de Brasília
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', // o fuso de Brasília
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const today = new Date();
    const lastInteractionDate = new Date(lastInteractionTimestamp * 1000); // converte de segundos pra ms

    const todayString = formatter.format(today); // ex: "2025-08-15"

    // cria a data de "ontem" baseada no hoje
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = formatter.format(yesterday); // ex: "2025-08-14"
    
    const lastInteractionDayString = formatter.format(lastInteractionDate);

    // agora a gente só compara os textos, que já estão no fuso certo
    if (lastInteractionDayString === yesterdayString) {
        // se a última interação foi ontem, aumenta o streak
        updateUser(userId, 'streak', (userData.streak || 0) + 1);
    } else if (lastInteractionDayString !== todayString) {
        // se não foi ontem E também não foi hoje, reseta o streak
        updateUser(userId, 'streak', 1);
    }
    // se foi hoje, não faz nada
}

async function trackInteraction(interaction) {
    if (interaction.user.bot) return;

    const now = Math.floor(Date.now() / 1000);
    const userId = interaction.user.id;
    let commandString = 'N/A';
    
    if (interaction.isChatInputCommand()) {
        commandString = `/${interaction.commandName}`;
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommand) commandString += ` ${subcommand}`;
    } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
        commandString = `Componente: ${interaction.customId.split('_')[0]}`;
    }

    const userData = getUser(userId);
    if (!userData.firstInteraction) {
        updateUser(userId, 'firstInteraction', now);
        updateUser(userId, 'streak', 1); // começa o streak na primeira interação
    }

    // chama nosso novo especialista em streaks
    handleStreak(userData);
    
    // atualiza os outros dados do usuário
    updateUser(userId, 'lastInteraction', now);
    updateUser(userId, 'interactionCount', (userData.interactionCount || 0) + 1);
    const userLastCommands = userData.last10Commands ? JSON.parse(userData.last10Commands) : [];
    userLastCommands.unshift({ name: commandString, at: now, guild: interaction.guild?.id || 'DM' });
    if (userLastCommands.length > 10) userLastCommands.pop();
    updateUser(userId, 'last10Commands', JSON.stringify(userLastCommands, null, 2));

    // atualiza dados do servidor
    if (interaction.inGuild()) {
        const guildId = interaction.guild.id;
        const guildData = getGuild(interaction.guild);
        
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

    // atualiza dados globais
    const currentMapRaw = getAnalyticsValue.get('commandUsageMap')?.value || '{}';
    const commandMap = JSON.parse(currentMapRaw);
    commandMap[commandString] = (commandMap[commandString] || 0) + 1;
    setAnalyticsValue.run('commandUsageMap', JSON.stringify(commandMap, null, 2));
}

module.exports = { trackInteraction };