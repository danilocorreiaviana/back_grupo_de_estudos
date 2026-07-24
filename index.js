const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const alunoRoute = require('./route/alunoRoute');
const grupoRoute = require('./route/grupoRoute');

const app = express();


app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());

app.use(cors({
    origin: "https://grupo-de-estudos.vercel.app"
}));

app.use(express.json());


async function connectMongo(){

    if(mongoose.connection.readyState === 1){
        return;
    }

    await mongoose.connect(process.env.DB_CONCT);

    console.log("Mongo conectado");
}


app.use(async(req,res,next)=>{

    try{

        await connectMongo();

        next();

    }catch(error){

        console.log("Erro Mongo middleware:", error);

        return res.status(500).json({
            erro:"Erro conexão banco"
        });
    }

});

// Rotas
app.use(alunoRoute);
app.use(grupoRoute);


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});


module.exports = app;
