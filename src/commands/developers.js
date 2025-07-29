// src/commands/desenvolvedor/developers.js
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getUser } = require('../../database/db.js');
const createEmbed = require('../utils/createEmbed.js');
const getLanguage = require('../utils/getLanguage.js');
const util = require('node:util');

// central de textos pra deixar o código limpo
const texts = {
    accessDenied: {
        title: {
            'pt_BR': '<:selodev1:1397393789198532648> Acesso Negado',
            'en_US': '<:selodev1:1397393789198532648> Access Denied',
        },
        description: {
            'pt_BR': ['<:bussola:1397394024113115286> Você está perdido? Esta área é restrita apenas para desenvolvedores.', 'Opps, lugar errado! Apenas a minha equipe pode usar este comando.'],
            'en_US': ['<:bussola:1397394024113115286> Are you lost? This area is restricted to developers only.', 'Oops, wrong place! Only my team can use this command.'],
        }
    },
    eval: {
        title: {
            'pt_BR': '<:ferramenta1:1397394095697301589> Eval Executado',
            'en_US': '<:ferramenta1:1397394095697301589> Eval Executed',
        },
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
            const randomDesc = texts.accessDenied.description[lang][Math.floor(Math.random() * texts.accessDenied.description[lang].length)];
            const deniedEmbed = await createEmbed(interaction, {
                title: texts.accessDenied.title[lang],
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

            if (output.length > 4000) {
                output = output.substring(0, 4000) + '...';
            }

            const evalEmbed = await createEmbed(interaction, {
                title: texts.eval.title[lang],
                fields: [
                    { name: texts.eval.fields.code[lang], value: `\`\`\`js\n${codeToEval.slice(0, 1000)}\n\`\`\`` },
                    { name: texts.eval.fields.output[lang], value: `\`\`\`js\n${output}\n\`\`\`` }
                ]
            });

            await interaction.editReply({ embeds: [evalEmbed] });
        }
    },
};