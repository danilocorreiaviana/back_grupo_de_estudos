// index.js - Ponto de entrada com logs
console.log('🚀 [INDEX] Iniciando index.js');
console.log('📂 [INDEX] Diretório atual:', __dirname);
console.log('📂 [INDEX] Arquivos no diretório:', require('fs').readdirSync(__dirname).join(', '));

// Log de variáveis de ambiente
console.log('🔑 [INDEX] Verificando variáveis de ambiente:');
console.log('  - DB_CONCT definida?', !!process.env.DB_CONCT);
console.log('  - DB_CONCT começa com:', process.env.DB_CONCT ? process.env.DB_CONCT.substring(0, 30) + '...' : 'NÃO DEFINIDA');
console.log('  - PORT:', process.env.PORT || 'não definida (usando 3000)');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'não definido');

// Captura erros
process.on('uncaughtException', (err) => {
    console.error('💥 [INDEX] ERRO NÃO CAPTURADO (síncrono):', err);
    console.error('💥 [INDEX] Stack:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [INDEX] ERRO NÃO CAPTURADO (assíncrono):', reason);
    console.error('💥 [INDEX] Promise:', promise);
    process.exit(1);
});

console.log('🔵 [INDEX] PASSO 1: Tentando importar app...');

try {
    console.log('🔵 [INDEX] Importando ./app...');
    const app = require('./app');
    console.log('✅ [INDEX] App importado com sucesso');
    
    const PORT = process.env.PORT || 3000;
    console.log(`🔵 [INDEX] PASSO 2: Iniciando servidor na porta ${PORT}`);
    
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ [INDEX] Servidor rodando na porta ${PORT}`);
        console.log(`✅ [INDEX] Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✅ [INDEX] Servidor pronto para receber requisições`);
    });
    
    server.timeout = 30000;
    console.log(`✅ [INDEX] Timeout do servidor configurado para 30s`);
    
    server.on('error', (err) => {
        console.error('💥 [INDEX] Erro no servidor:', err);
        console.error('💥 [INDEX] Stack:', err.stack);
    });
    
    server.on('listening', () => {
        console.log('✅ [INDEX] Evento "listening" disparado');
    });
    
    console.log('✅ [INDEX] Servidor iniciado com sucesso');
    
} catch (error) {
    console.error('💥 [INDEX] ERRO AO IMPORTAR APP:', error);
    console.error('💥 [INDEX] Mensagem:', error.message);
    console.error('💥 [INDEX] Stack:', error.stack);
    console.error('💥 [INDEX] Nome do erro:', error.name);
    
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('💥 [INDEX] Módulo não encontrado:', error.requireStack);
    }
    
    process.exit(1);
}

console.log('🔵 [INDEX] Index.js finalizado com sucesso');
