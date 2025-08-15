const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getUser, updateUser } = require('../../database/db.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const util = require('node:util');
const { logEval } = require('../utils/interactionLogger.js');

// central de textos pra deixar o código limpo
const texts = {
    accessDenied: {
        title: { 'pt_BR': '<:bussola:1397394024113115286> Acesso Negado', 'en_US': '<:bussola:1397394024113115286> Access Denied' },
        description: {
            'pt_BR': ['Esta área é restrita apenas para desenvolvedores.', 'Apenas a minha equipe pode usar este comando, foi mal!'],
            'en_US': ['This area is restricted to developers only.', 'Only my team can use this command, haha!'],
        }
    },
    ownerOnly: {
        'pt_BR': '<:coroa1:1397390930675499179> Apenas o dono do bot pode gerenciar a equipe.',
        'en_US': '<:coroa1:1397390930675499179> Only the bot owner can manage the team.',
    },
    devAdded: {
        'pt_BR': '<:mais:1397392605914071062> O usuário foi adicionado à equipe de desenvolvimento!',
        'en_US': '<:mais:1397392605914071062> The user has been added to the development team!',
    },
    devRemoved: {
        'pt_BR': '<:selodev2:1397393732999053372> O usuário foi removido da equipe de desenvolvimento.',
        'en_US': '<:selodev2:1397393732999053372> The user has been removed from the development team.',
    },
    eval: {
        title: { 'pt_BR': '<:vscode:1397393671791312906> Eval Executado', 'en_US': '<:vscode:1397393671791312906> Eval Executed' },
        fields: {
            code: { 'pt_BR': 'Código Executado', 'en_US': 'Executed Code' },
            output: { 'pt_BR': 'Saída', 'en_US': 'Output' },
        }
    }
};


module.exports = {
    data: new SlashCommandBuilder()
        .setName('developers')
        .setDescription('Comandos restritos para a equipe de desenvolvimento.')
        .setDescriptionLocalizations({ 'en-US': 'Restricted commands...', 'pt-BR': 'Comandos restritos...' })
        .setDMPermission(true)
        .addSubcommand(subcommand => subcommand.setName('eval').setDescription('Devs ❯ Executa um código JavaScript.') .addStringOption(option => option.setName('codigo').setNameLocalizations({ 'en-US': 'code' }).setDescription('O código a ser executado.').setRequired(true)) )
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('Dono ❯ Adiciona um usuário à equipe de desenvolvedores.').addUserOption(option => option.setName('usuario').setNameLocalizations({ 'en-US': 'user' }).setDescription('O usuário a ser adicionado.').setRequired(true)) )
        .addSubcommand(subcommand => subcommand.setName('remover').setNameLocalizations({ 'en-US': 'remove' }).setDescription('Dono ❯ Remove um usuário da equipe de desenvolvedores.').addUserOption(option => option.setName('usuario').setNameLocalizations({ 'en-US': 'user' }).setDescription('O usuário a ser removido.').setRequired(true)) ),

    async execute(interaction, client) {
        const userData = getUser(interaction.user.id);
        const lang = getLanguage(interaction);

        if (interaction.user.id !== process.env.OWNER_ID && userData.isDeveloper !== 1) {
            const randomDesc = texts.accessDenied.description[lang][Math.floor(Math.random() * texts.accessDenied.description[lang].length)];
            const deniedEmbed = await createEmbed(interaction, { title: texts.accessDenied.title[lang], description: randomDesc });
            return interaction.reply({ embeds: [deniedEmbed], flags: [MessageFlags.Ephemeral] });
        }

        const subCommandName = interaction.options.getSubcommand();

        switch (subCommandName) {
            case 'eval': {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const codeToEval = interaction.options.getString('codigo');
                let output = '';
                try {
                    const evaled = await eval(codeToEval);
                    output = util.inspect(evaled, { depth: 0 });
                } catch (error) {
                    output = error.stack || error.toString();
                }
                await logEval(interaction, codeToEval, output);
                if (output.length > 1000) output = output.substring(0, 1000) + '...';
                const evalEmbed = await createEmbed(interaction, {
                    title: texts.eval.title[lang],
                    fields: [
                        { name: texts.eval.fields.code[lang], value: `\`\`\`js\n${codeToEval.slice(0, 1000)}\n\`\`\`` },
                        { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\`` }
                    ]
                });
                await interaction.editReply({ embeds: [evalEmbed] });
                break;
            }

            case 'add':
            case 'remover': {
                // AQUI A MUDANÇA: adiciona o deferReply
                await interaction.deferReply();

                if (interaction.user.id !== process.env.OWNER_ID) {
                    const ownerEmbed = await createEmbed(interaction, { description: texts.ownerOnly[lang] });
                    return interaction.editReply({ embeds: [ownerEmbed] });
                }

                const targetUser = interaction.options.getUser('usuario');
                const isAdding = subCommandName === 'add';
                
                updateUser(targetUser.id, 'isDeveloper', isAdding ? 1 : 0);

                const responseText = isAdding ? texts.devAdded[lang] : texts.devRemoved[lang];
                const successEmbed = await createEmbed(interaction, {
                    description: `<:seloestrela:1397390594598371368> **${targetUser.tag}** ${responseText}`
                });
                // AQUI A MUDANÇA: usa editReply
                await interaction.editReply({ embeds: [successEmbed] });
                break;
            }
        }
    },
};
