// src/utils/errorHandler.js

// esse arquivo vai cuidar de qualquer erro q n for pego pelos nossos try...catch
// ele é o airbag do bot

module.exports = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('[ERRO GRAVE] Rejeição não tratada em:', promise, 'motivo:', reason);
        // aqui vc poderia logar o erro num canal do discord com um webhook, por exemplo
    });

    process.on('uncaughtException', (error, origin) => {
        console.error('[ERRO GRAVE] Exceção não capturada:', error, 'origem:', origin);
        // o ideal aqui seria reiniciar o bot, mas por enquanto, só logar já previne o crash
    });

    process.on('uncaughtExceptionMonitor', (error, origin) => {
        console.error('[ERRO GRAVE] Exceção não capturada (Monitor):', error, 'origem:', origin);
    });

    // esse aqui é pra quando o bot receber um aviso (warning) do node
    process.on('warning', (warning) => {
        console.warn('[AVISO] Alerta do processo:', warning);
    });

    console.log('[Handler de Erros] Vigia global de erros ativado.');
};