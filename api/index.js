const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const alunoRoute = require('../route/alunoRoute');
const grupoRoute = require('../route/grupoRoute');

const app = express();


let cachedConnection = global.mongooseConnection;

if (!cachedConnection) {
    cachedConnection = global.mongooseConnection = {
        conn: null,
        promise: null
    };
}

async function connectMongo() {
    if (cachedConnection.conn) {
        return cachedConnection.conn;
    }

    if (!cachedConnection.promise) {
        cachedConnection.promise = mongoose.connect(process.env.DB_CONCT)
            .then((mongooseInstance) => {
                console.log('Mongo conectado');
                return mongooseInstance;
            })
            .catch((err) => {
                console.log('Erro Mongo:', err);
                throw err;
            });
    }

    cachedConnection.conn = await cachedConnection.promise;

    return cachedConnection.conn;
}

connectMongo();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
app.use(cors());


// Rotas
app.use(alunoRoute);
app.use(grupoRoute);


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});


module.exports = app;
