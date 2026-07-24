const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const alunoRoute = require('../route/alunoRoute');
const grupoRoute = require('../route/grupoRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());

app.use(cors({
    origin: "https://grupo-de-estudos.vercel.app"
}));

// Função de conexão MongoDB
async function connectMongo() {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    await mongoose.connect(process.env.DB_CONCT);
    console.log("Mongo conectado");
}

// Middleware de conexão
app.use(async (req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    
    try {
        await connectMongo();
        next();
    } catch (error) {
        console.log("Erro Mongo middleware:", error);
        return res.status(500).json({
            erro: "Erro conexão banco"
        });
    }
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Backend - Grupo de Estudos',
        endpoints: ['/aluno', '/grupo', '/health']
    });
});

app.use("/", alunoRoute);
app.use("/", grupoRoute); 

// Arquivos estáticos
app.use(express.static('public'));

// Middleware 404
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        path: req.url
    });
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        erro: 'Erro interno do servidor'
    });
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
