// src/commands/desenvolvedor/developers.js
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getUser } = require('../../database/db.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const util = require('node:util');
const { logEval } = require('../utils/interactionLogger.js'); // importa o novo logger de eval

// textos para a resposta de acesso negado
const accessDeniedTexts = {
    title: {
        'pt_BR': '<:bussola:1397394024113115286> Você está perdido? ',
        'en_US': '<:bussola:1397394024113115286> Are you lost? ',
    },
    description: {
        'pt_BR': ['Esta área é restrita apenas para desenvolvedores.', 'Apenas a minha equipe pode usar este comando, foi mal!'],
        'en_US': ['This area is restricted to developers only.', 'Only my team can use this command, haha!'],
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('developers')
        .setDescription('Comandos restritos para a equipe de desenvolvimento.')
        .setDescriptionLocalizations({
            'en-US': 'Restricted commands for the development team.',
            'pt-BR': 'Comandos restritos para a equipe de desenvolvimento.',
        })
        .setDMPermission(true)
        .addSubcommand(subcommand =>
            subcommand
                .setName('eval')
                .setDescription('Devs ❯ Executa um código JavaScript.')
                .setDescriptionLocalizations({
                    'en-US': 'Devs ❯ Executes JavaScript code.',
                    'pt-BR': 'Devs ❯ Executa um código JavaScript.',
                })
                .addStringOption(option => 
                    option.setName('codigo')
                        .setNameLocalizations({ 'en-US': 'code' })
                        .setDescription('O código a ser executado.')
                        .setDescriptionLocalizations({
                            'en-US': 'The code to be executed.',
                            'pt-BR': 'O código a ser executado.',
                        })
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        const userData = getUser(interaction.user.id);
        const lang = getLanguage(interaction);

        // -- trava de segurança principal --
        if (userData.isDeveloper !== 1) {
            const randomDesc = accessDeniedTexts.description[lang][Math.floor(Math.random() * accessDeniedTexts.description[lang].length)];
            const deniedEmbed = await createEmbed(interaction, {
                title: accessDeniedTexts.title[lang],
                description: randomDesc,
            });
            return interaction.reply({ embeds: [deniedEmbed], flags: [MessageFlags.Ephemeral] });
        }

        const subCommandName = interaction.options.getSubcommand();

        if (subCommandName === 'eval') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            
            const codeToEval = interaction.options.getString('codigo');
            let output = '';

            try {
                const evaled = await eval(codeToEval);
                output = util.inspect(evaled, { depth: 0 });
            } catch (error) {
                output = error.stack || error.toString();
            }

            // chama o logger de eval ANTES de cortar o output
            await logEval(interaction, codeToEval, output);

            // limita o output pra n quebrar a embed de resposta pro usuário
            if (output.length > 1000) {
                output = output.substring(0, 1000) + '...';
            }

            const evalEmbed = await createEmbed(interaction, {
                title: lang === 'pt_BR' ? '<:ferramenta1:1397394095697301589> Eval Executado' : '<:ferramenta1:1397394095697301589> Eval Executed',
                fields: [
                    { name: lang === 'pt_BR' ? 'Código Executado' : 'Executed Code', value: `\`\`\`js\n${codeToEval.slice(0, 1000)}\n\`\`\`` },
                    { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\`` }
                ]
            });

            await interaction.editReply({ embeds: [evalEmbed] });
        }
    },
};