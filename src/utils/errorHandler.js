// src/handlers/errorHandler.js

// vigia global pra pegar qualquer erro q n for tratado e impedir o bot de crashar
// tem q ser o primeiro require no index.js pra funcionar direito

module.exports = () => {
    // qnd uma promise da pau e ngm pega o erro com .catch()
    process.on('unhandledRejection', (reason, promise) => {
        console.error('[process] unhandled rejection:', reason);
    });

    // qnd um erro de código normal (síncrono) escapa de um try/catch
    process.on('uncaughtException', (error, origin) => {
        console.error('[process] uncaught exception:', error, origin);
    });

    // um monitor extra pra exceções, só por garantia
    process.on('uncaughtExceptionMonitor', (error, origin) => {
        console.error('[process] uncaught exception monitor:', error, origin);
    });

    // qnd o proprio node.js manda um aviso (ex: 'ephemeral' obsoleto)
    process.on('warning', (warning) => {
        console.warn('[process] warning:', warning.name, '-', warning.message);
    });

    console.log('[errorHandler] vigia de erros globais ativado.');
};