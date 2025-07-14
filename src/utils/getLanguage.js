// src/utils/getLanguage.js
const { getUser } = require('../../database/db.js');

function getLanguage(context) {
    // pega o id do usuario, seja de uma interaction ou de uma message
    const userId = context.user ? context.user.id : context.author.id;
    const userData = getUser(userId);

    // checa a preferencia do usuario no db
    switch (userData.language) {
        case 'lang_pt_br':
            return 'pt_BR';
        case 'lang_en_us':
            return 'en_US';
        case 'lang_auto':
        default:
            // se for 'auto' ou qualquer outra coisa, usa a lingua do Discord da pessoa
            return context.locale === 'pt-BR' ? 'pt_BR' : 'en_US';
    }
}

module.exports = getLanguage;