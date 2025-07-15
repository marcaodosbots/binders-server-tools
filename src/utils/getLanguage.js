// src/utils/getLanguage.js
const { getUser } = require('../../database/db.js');

function getLanguage(context) {
    const userId = context.user ? context.user.id : context.author.id;
    const userData = getUser(userId);

    // checa a preferência salva no db
    switch (userData.language) {
        // 1. se o user forçou um idioma fixo, a gente obedece sem questionar
        case 'lang_pt_br':
            return 'pt_BR';
        case 'lang_en_us':
            return 'en_US';
        
        // 2. se for 'auto', a gente entra na lógica nova
        case 'lang_auto':
        default:
            // se o contexto é uma interação (slash, botão, menu), ela tem o idioma mais atualizado. usamos ele.
            if (context.isInteraction) {
                return context.locale === 'pt-BR' ? 'pt_BR' : 'en_US';
            }
            
            // se não é uma interação (é uma menção), a gente usa a 'memória' do último idioma visto.
            if (userData.lastKnownLocale) {
                return userData.lastKnownLocale;
            }

            // 3. como último recurso (ex: primeira menção de todas), usa o locale da mensagem
            return context.locale === 'pt-BR' ? 'pt_BR' : 'en_US';
    }
}

module.exports = getLanguage;