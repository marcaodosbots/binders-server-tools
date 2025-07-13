// esse arquivo n é um evento de verdade, é mais um 'ajudante' pro interactionCreate
// a gente exporta só a função de execução
module.exports = {
    execute(interaction) {
        // checa a lingua do usuario e define a frase certa numa variavelasd
        const content = interaction.locale === 'pt-BR'
            ? '<:support:1393820810434576434> Estamos deixando as coisas mais incríveis! Entre no nosso [servidor de suporte](https://discord.gg/Y2jJadbUmY) e descubra, ao vivo, o que está acontecendo!'
            : '<:support:1393820810434576434> We\'re making things more awesome! Join our [support server](https://discord.gg/Y2jJadbUmY) and find out, live, what\'s going on!';

        // agora a gente manda a resposta uma vez só, com a frase que a gente escolheu
        return interaction.reply({ 
            content: content,
            ephemeral: true // a msg aparece só pra quem usou o comando
        });
    },
};