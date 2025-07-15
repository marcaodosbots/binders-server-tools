// src/utils/getLanguage.js
const { getUser } = require('../../database/db.js'); // puxa a função de pegar user do nosso db

function getLanguage(context) {
    // descobre se o contexto é uma interaction ou uma message e pega o id do user
    const isInteraction = !!context.user;
    const userId = isInteraction ? context.user.id : context.author.id;
    const userData = getUser(userId);

    // checa a preferência de idioma salva no db
    switch (userData.language) {
        // 1. se o user forçou um idioma fixo, a gente obedece sem questionar
        case 'lang_pt_br':
            return 'pt_BR';
        case 'lang_en_us':
            return 'en_US';
        
        // 2. se a config for 'auto', entra na nossa lógica inteligente
        case 'lang_auto':
        default:
            // se for uma interação, a gente sempre pega o idioma mais fresco do discord
            if (isInteraction) {
                return context.locale === 'pt-BR' ? 'pt_BR' : 'en_US';
            }
            
            // se for uma menção (message), a gente usa a 'memória' do último idioma visto.
            // se n tiver nada na memória, aí sim usa o locale da msg como fallback final.
            return userData.lastKnownLocale || (context.locale === 'pt-BR' ? 'pt_BR' : 'en_US');
    }
}

module.exports = getLanguage;