const { Events } = require('discord.js');

// aqui a gente 'importa' nosso novo ajudante de comando não encontrado
const handleNoCommand = require('./no_command.js');

module.exports = {
    name: Events.InteractionCreate, // o nome do evento que a gente ta ouvindo
    once: false, // 'false' pq a gente quer ouvir todas as interações, não só a primeira
    
    async execute(interaction, client) {
        // ignora tudo q n for slash command (botões, menus, etc. a gente ve depois)
        if (!interaction.isChatInputCommand()) return;

        // busca o comando na collection que ta no client
        const command = client.commands.get(interaction.commandName);

        // se o comando não existir na nossa collection...
        if (!command) {
            console.error(`Comando não encontrado: ${interaction.commandName}`);
            // ...a gente chama nosso ajudante pra mandar a resposta!
            return handleNoCommand.execute(interaction);
        }

        // se achou o comando, tenta executar
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Deu um erro ao executar esse comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Deu um erro ao executar esse comando!', ephemeral: true });
            }
        }
    },
};