// src/utils/getLanguage.js
const { getUser } = require('../../database/db.js');

function getLanguage(context) {
    const userId = context.user ? context.user.id : context.author.id;
    const userData = getUser(userId);

    // checa a preferência salva no db
    switch (userData.language) {
        // 1. se forçou um idioma fixo, obedece
        case 'lang_pt_br':
            return 'pt_BR';
        case 'lang_en_us':
            return 'en_US';
        
        // 2. se for 'auto', entra na nossa lógica inteligente
        case 'lang_auto':
        default:
            // pega o melhor idioma disponível (o da interação ou da 'memória')
            const bestAvailableLocale = (context.user && context.locale) || userData.lastKnownLocale || context.locale;
            
            // AQUI A MUDANÇA: a gente normaliza o resultado.
            // se o idioma for pt-BR, a gente usa. pra QUALQUER outra coisa, a gente usa en_US como padrão.
            return bestAvailableLocale === 'pt-BR' ? 'pt_BR' : 'en_US';
    }
}

module.exports = getLanguage;