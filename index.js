// app.js - Versão com logs detalhados
console.log('🔵 [APP] Iniciando carregamento do app.js');

try {
    console.log('🔵 [APP] Importando dependências...');
    const path = require('path');
    const cors = require('cors');
    const mongoose = require('mongoose');
    const express = require('express');
    const bodyParser = require('body-parser');
    console.log('✅ [APP] Dependências importadas com sucesso');

    console.log('🔵 [APP] Importando rotas...');
    const alunoRoute = require('./route/alunoRoute');
    console.log('✅ [APP] Rota aluno importada');
    
    const grupoRoute = require('./route/grupoRoute');
    console.log('✅ [APP] Rota grupo importada');

    console.log('🔵 [APP] Criando app Express...');
    const app = express();
    console.log('✅ [APP] App Express criado');

    console.log('🔵 [APP] Configurando middlewares...');
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
    app.use(express.json());
    console.log('✅ [APP] BodyParser configurado');

    console.log('🔵 [APP] Configurando CORS...');
    app.use(cors({
        origin: "https://grupo-de-estudos.vercel.app"
    }));
    console.log('✅ [APP] CORS configurado');

    console.log('🔵 [APP] Configurando função connectMongo...');
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
    console.log('✅ [APP] Função connectMongo definida');

    console.log('🔵 [APP] Configurando middleware de conexão...');
    app.use(async (req, res, next) => {
        console.log(`🔄 [MIDDLEWARE] Requisição recebida: ${req.method} ${req.path}`);
        try {
            await connectMongo();
            console.log('✅ [MIDDLEWARE] Conexão OK, continuando...');
            next();
        } catch (error) {
            console.error('❌ [MIDDLEWARE] Erro na conexão:', error);
            console.error('❌ [MIDDLEWARE] Stack:', error.stack);
            return res.status(500).json({
                erro: "Erro conexão banco",
                detalhe: error.message
            });
        }
    });
    console.log('✅ [APP] Middleware de conexão configurado');

    console.log('🔵 [APP] Configurando rotas...');
    app.use('/aluno', alunoRoute);
    console.log('✅ [APP] Rota /aluno configurada');
    
    app.use('/grupo', grupoRoute);
    console.log('✅ [APP] Rota /grupo configurada');
    console.log('✅ [APP] Rotas configuradas');

    console.log('🔵 [APP] Configurando arquivos estáticos...');
    app.use(express.static('public'));
    console.log('✅ [APP] Arquivos estáticos configurados');

    console.log('🔵 [APP] Configurando rota raiz...');
    app.get('/', (req, res) => {
        console.log('🔄 [ROTA] Requisição para /');
        res.sendFile('index.html', { root: 'public' });
    });
    console.log('✅ [APP] Rota raiz configurada');

    console.log('✅ [APP] App configurado com sucesso!');
    module.exports = app;
    console.log('✅ [APP] Exportação concluída');

} catch (error) {
    console.error('❌ [APP] ERRO FATAL durante configuração:', error);
    console.error('❌ [APP] Stack:', error.stack);
    // Re-throw para o index.js capturar
    throw error;
}
