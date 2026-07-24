// index.js - Versão completa e autônoma
console.log('🚀 [INDEX] Iniciando servidor...');

const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

// Importa as rotas
console.log('🔵 [INDEX] Importando rotas...');
const alunoRoute = require('./route/alunoRoute');
const grupoRoute = require('./route/grupoRoute');
console.log('✅ [INDEX] Rotas importadas');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔵 [INDEX] Configurando middlewares...');
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());

app.use(cors({
    origin: "https://grupo-de-estudos.vercel.app"
}));
console.log('✅ [INDEX] Middlewares configurados');

// Função de conexão MongoDB
async function connectMongo() {
    console.log('🔄 [MONGO] Verificando conexão...');
    if (mongoose.connection.readyState === 1) {
        console.log('✅ [MONGO] Já conectado');
        return;
    }
    console.log('🔄 [MONGO] Tentando conectar...');
    console.log('🔄 [MONGO] DB_CONCT existe?', !!process.env.DB_CONCT);
    
    if (!process.env.DB_CONCT) {
        console.error('❌ [MONGO] DB_CONCT NÃO DEFINIDA!');
        throw new Error('Variável DB_CONCT não definida');
    }
    
    await mongoose.connect(process.env.DB_CONCT);
    console.log("✅ [MONGO] Mongo conectado com sucesso");
}

// Middleware de conexão
app.use(async (req, res, next) => {
    console.log(`🔄 [MIDDLEWARE] Requisição: ${req.method} ${req.path}`);
    try {
        await connectMongo();
        console.log('✅ [MIDDLEWARE] Conexão OK');
        next();
    } catch (error) {
        console.error('❌ [MIDDLEWARE] Erro na conexão:', error);
        return res.status(500).json({
            erro: "Erro conexão banco",
            detalhe: error.message
        });
    }
});

// Rotas
console.log('🔵 [INDEX] Configurando rotas...');
app.use('/aluno', alunoRoute);
app.use('/grupo', grupoRoute);
console.log('✅ [INDEX] Rotas configuradas');

// Arquivos estáticos
app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log('🔄 [ROTA] Requisição para /');
    res.sendFile('index.html', { root: 'public' });
});

// Inicia o servidor
console.log(`🔵 [INDEX] Iniciando servidor na porta ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [INDEX] Servidor rodando na porta ${PORT}`);
    console.log(`✅ [INDEX] Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ [INDEX] Servidor pronto!`);
});

server.timeout = 30000;
console.log('✅ [INDEX] Timeout configurado para 30s');

// Captura erros
process.on('uncaughtException', (err) => {
    console.error('💥 [INDEX] ERRO NÃO CAPTURADO:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [INDEX] REJEIÇÃO NÃO TRATADA:', reason);
    process.exit(1);
});
