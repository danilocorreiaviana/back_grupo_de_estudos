// index.js - Versão com logs completos para debug
console.log('🚀 [INDEX] Iniciando servidor...');

const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

// Importa as rotas
console.log('🔵 [INDEX] Importando rotas...');
let alunoRoute, grupoRoute;

try {
    alunoRoute = require('./route/alunoRoute');
    console.log('✅ [INDEX] Rota aluno importada');
} catch (error) {
    console.error('❌ [INDEX] Erro ao importar alunoRoute:', error.message);
    // Cria uma rota fallback
    alunoRoute = express.Router();
    alunoRoute.all('*', (req, res) => {
        res.status(503).json({ erro: 'Rota aluno indisponível', detalhe: error.message });
    });
}

try {
    grupoRoute = require('./route/grupoRoute');
    console.log('✅ [INDEX] Rota grupo importada');
} catch (error) {
    console.error('❌ [INDEX] Erro ao importar grupoRoute:', error.message);
    // Cria uma rota fallback
    grupoRoute = express.Router();
    grupoRoute.all('*', (req, res) => {
        res.status(503).json({ erro: 'Rota grupo indisponível', detalhe: error.message });
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔵 [INDEX] Configurando middlewares...');
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());

// CORS mais permissivo para debug
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ [INDEX] Middlewares configurados');

// Middleware de log de todas as requisições
app.use((req, res, next) => {
    console.log(`📥 [REQ] ${req.method} ${req.url} - IP: ${req.ip}`);
    console.log(`📥 [REQ] Headers:`, req.headers);
    next();
});

// Função de conexão MongoDB com timeout
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
    
    // Timeout de 5 segundos para conexão
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao conectar MongoDB')), 5000);
    });
    
    const connectPromise = mongoose.connect(process.env.DB_CONCT, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log("✅ [MONGO] Mongo conectado com sucesso");
}

// Middleware de conexão com timeout
app.use(async (req, res, next) => {
    console.log(`🔄 [MIDDLEWARE] Processando: ${req.method} ${req.path}`);
    
    // Para rotas de health check, não precisa de banco
    if (req.path === '/health' || req.path === '/') {
        console.log('✅ [MIDDLEWARE] Rota pública, seguindo...');
        return next();
    }
    
    try {
        await connectMongo();
        console.log('✅ [MIDDLEWARE] Conexão OK');
        next();
    } catch (error) {
        console.error('❌ [MIDDLEWARE] Erro na conexão:', error);
        console.error('❌ [MIDDLEWARE] Stack:', error.stack);
        return res.status(503).json({
            erro: "Erro conexão banco",
            detalhe: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rota de health check (não precisa de banco)
app.get('/health', (req, res) => {
    console.log('✅ [HEALTH] Health check OK');
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
        env: {
            db_defined: !!process.env.DB_CONCT,
            node_env: process.env.NODE_ENV,
            port: PORT
        }
    });
});

// Rota raiz (não precisa de banco)
app.get('/', (req, res) => {
    console.log('🔄 [ROTA] Requisição para /');
    try {
        res.sendFile('index.html', { root: 'public' });
    } catch (error) {
        console.error('❌ [ROTA] Erro ao enviar index.html:', error);
        res.json({
            mensagem: 'API Backend - Grupo de Estudos',
            endpoints: ['/aluno', '/grupo', '/health'],
            status: 'online'
        });
    }
});

// Rotas principais
console.log('🔵 [INDEX] Configurando rotas...');
app.use('/aluno', alunoRoute);
app.use('/grupo', grupoRoute);
console.log('✅ [INDEX] Rotas configuradas');

// Middleware de erro para rotas não encontradas
app.use((req, res) => {
    console.log(`❌ [404] Rota não encontrada: ${req.method} ${req.url}`);
    res.status(404).json({
        erro: 'Rota não encontrada',
        path: req.url,
        method: req.method
    });
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('💥 [ERROR] Erro global:', err);
    console.error('💥 [ERROR] Stack:', err.stack);
    res.status(500).json({
        erro: 'Erro interno do servidor',
        mensagem: err.message,
        timestamp: new Date().toISOString()
    });
});

// Inicia o servidor
console.log(`🔵 [INDEX] Iniciando servidor na porta ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [INDEX] Servidor rodando na porta ${PORT}`);
    console.log(`✅ [INDEX] Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ [INDEX] Health check: http://localhost:${PORT}/health`);
    console.log(`✅ [INDEX] Servidor pronto!`);
});

server.timeout = 30000;

// Captura erros do servidor
server.on('error', (error) => {
    console.error('💥 [SERVER] Erro no servidor:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ [SERVER] Porta ${PORT} já está em uso`);
    }
});

// Captura erros globais
process.on('uncaughtException', (err) => {
    console.error('💥 [INDEX] ERRO NÃO CAPTURADO:', err);
    console.error('💥 [INDEX] Stack:', err.stack);
    // Não mata o processo em produção
    if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ [INDEX] Mantendo servidor ativo apesar do erro');
    } else {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [INDEX] REJEIÇÃO NÃO TRATADA:', reason);
    console.error('💥 [INDEX] Promise:', promise);
});

console.log('✅ [INDEX] Servidor iniciado com sucesso!');
