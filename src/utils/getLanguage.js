// src/utils/getLanguage.js
const { getUser } = require('../../database/db.js');

function getLanguage(context) {
    const userId = context.user ? context.user.id : context.author.id;
    const userData = getUser(userId);

    switch (userData.language) {
        case 'lang_pt_br':
            return 'pt_BR';
        case 'lang_en_us':
            return 'en_US';
        case 'lang_auto':
        default:
            return context.locale === 'pt-BR' ? 'pt_BR' : 'en_US';
    }
}

module.exports = getLanguage;