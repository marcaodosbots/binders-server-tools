module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // checa se é botão
        if (!interaction.isButton()) return;

        // se já foi respondido ou adiado, nem faz nada
        if (interaction.replied || interaction.deferred) return;

        // responde com a msg do suporte
        await interaction.reply({
            content: '<:support:1393820810434576434> estamos deixando as coisas mais incríveis! entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que tá rolando!',
            ephemeral: true // só o user vê
        });
    }
};
