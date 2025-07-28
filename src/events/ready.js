const { Events, ActivityType } = require('discord.js');
const { sendLifecycleLog } = require('../utils/lifecycleLogger.js');
// a lista inicial de status, vc pode botar todos os seus aqui
/*
let statusList = [
    '❌ Punindo membros que fazem coisas não tão legais!',
    '📈 Usando API\'s para te ajudar!',
    '🌐 dsc.gg/bindersdc',
    '🦅 "MY PRONOUMS ARE U.S.A"',
    '🔭 Observando as estrelas...',
    '💎 "Você deve confessar o seu amor antes que alguém com menos amor e mais coragem faça no seu lugar."',
    '🙄 "Ô Denise..."',
    '💠 "I o pix, nada ainda?"',
    '💥 "Se ela dança, eu danço!"',
    '🎷 "Não deixe o samba morrer, não deixe o samba acabar..."',
    '🏝 "Deixa acontecer naturalmente..."',
    '🎈 "Chega de manias, toda dengosa..."',
    '🔥 "Ela só pensa em beijar, beijar..."',
    '🌧 "Na adversidade, alguns desistem, enquanto outros batem recordes."',
    '🏛 "A educação é a arma mais poderosa que você pode usar para mudar o mundo."',
    '📚 "Uma criança, um professor, um livro e uma caneta podem mudar o mundo."',
    '✍ "Como é maravilhoso que ninguém precise esperar um único momento antes de começar a melhorar o mundo."',
    '🌍 "Em algum lugar, algo incrível está esperando para ser descoberto."',
    '💎 "Darling, you look perfect tonight"',
    '💓 "Her eyes, her eyes, makes the stars look like they\'re not shining"',
    '🍉 Tamo junto @raposita!',
    '🍉 "Kapa" - @raposita',
    '🎮 "Ela sempre logava no mesmo lugar, e logo saia pra se aventurar..."',
    '💲 "Said \'no more counting dollars we\'ll be counting stars, yeah we\'ll be counting stars..."',
    '😝 "Aí Vey, não sei" - Jessy',
    '🙄 "aff veyr q odio 💯" - Analu',
    '😜 "ô seu viado" - Estevam',
    '🐱‍🐉 Tamo junto @towrns!',
    '💔 "Valha" - Anakasa',
    '💥 "KABOOM" - Lonnie',
    '🔥 "ATTACK THE D POINT 💯💯💯"',
    '🙄 "Understand" - Lulu',
    '🐈 "meow" - Livvy',
    '😾 no more meows, olivia!',
    '😐 "tenso" - JayA',
    '🗡️ "Se você quer um inimigo, é só falar o que pensa." - Sean',
    '📄 "Quero Uma Frase" - Souza',
    '☠️🍷 "Joy Boy... HAS RETURNED!" - Hunter',
    '🎶 "Jogado aos teus pés, com mil rosas roubadas, exageradooo" - Binder',
    '💭 "Eu posso mandar um KKKK sem rir, mas nunca um bom dia sem ter acordado" - @towrns',
    '🚪🚶‍♀️ "af, tchau" - Xolofoni',
    '⚽ "SIUUUUUUUUUUUU" - Mary',
    '❓ Use o /ajuda!'
];
*/
let statusList = [
    '🛠 Estamos deixando as coisas mais incríveis! Em manuntenção!'
];

module.exports = {
    name: Events.ClientReady,
    once: true,
    
    async execute(client) {
        sendLifecycleLog('🟢 Bot Online!', 'Green');
        console.log(`[Logado] ${client.user.tag}`);

        // --- VERIFICADOR DE COMANDOS NA API ---
        try {
            const commands = await client.application.commands.fetch();
            let subcommandCount = 0;
            
            commands.forEach(cmd => {
                // AQUI A CORREÇÃO: trocamos o nome gigante pelo número '1'
                const subcommands = cmd.options?.filter(opt => opt.type === 1) || [];
                subcommandCount += subcommands.length;
            });

            console.log(`[API] Encontrados ${commands.size} comandos e ${subcommandCount} subcomandos registrados.`);
        } catch (error) {
            console.error('[API] Falha ao verificar comandos:', error);
        }
        
        // ---- LÓGICA DO STATUS ROTATIVO ----
        const shuffle = (array) => {
            let currentIndex = array.length, randomIndex;
            const newArray = [...array];
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
            }
            return newArray;
        };
        
        let shuffledStatus = shuffle(statusList);
        let statusIndex = 0;
    
        setInterval(() => {
            if (statusIndex >= shuffledStatus.length) {
                shuffledStatus = shuffle(statusList);
                statusIndex = 0;
            }
            const newStatus = shuffledStatus[statusIndex];
            client.user.setActivity(newStatus, { type: ActivityType.Custom });
            statusIndex++;
        }, 30000);
    },
};