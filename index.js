const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const alunoRoute = require('../route/alunoRoute');
const grupoRoute = require('../route/grupoRoute');

const app = express();

// Conexão Mongo (forma correta para serverless)
if (!mongoose.connections[0].readyState) {
    mongoose.connect(process.env.DB_CONCT)
        .then(() => console.log('Mongo conectado'))
        .catch(err => console.log('Erro Mongo:', err));
}

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
app.use(cors());

// Rotas
app.use(alunoRoute);
app.use(grupoRoute);

// Página raiz
app.get('/', (req, res) => {
    res.send('API Grupo de Estudos rodando 🚀');
});

// 👇 ESSA LINHA É A CHAVE PARA VERCEL
module.exports = app;
