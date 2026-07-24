const alunoRoute = require('express').Router();
const aluno = require('../model/alunoModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware que verifica JWT
const verificarJWT = (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return res.json({
            logado: false,
            mensagem: 'Token não foi enviado.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({
                logado: false,
                mensagem: 'Falha na autenticação'
            });
        }
        next();
    });
};

// ✅ CORRIGIDO: removido o /aluno de todas as rotas
// Cadastro aluno
alunoRoute.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, foto } = req.body;

        if (!nome || !email || !senha) {
            return res.json({
                mensagem: 'Erro! Alguns campos não foram definidos!'
            });
        }

        const existeAluno = await aluno.findOne({ email });

        if (existeAluno) {
            return res.json({
                mensagem: 'Erro! Email já cadastrado!'
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await aluno.create({
            nome,
            email,
            senha: senhaCriptografada,
            foto
        });

        return res.json({
            mensagem: 'Aluno cadastrado com sucesso :)'
        });

    } catch (erro) {
        console.log("Erro cadastro:", erro);
        return res.status(500).json({
            mensagem: 'Erro no cadastro do aluno :('
        });
    }
});

// ✅ CORRIGIDO: removido o /aluno
// LOGIN
alunoRoute.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: "Email e senha obrigatórios"
            });
        }

        const user = await aluno.findOne({ email });

        if (!user) {
            return res.json({
                error: "Usuário não encontrado!"
            });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.json({
                status: "error",
                error: "Senha inválida!"
            });
        }

        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 864000 }
        );

        return res.status(200).json({
            status: "ok",
            data: token,
            body: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                foto: user.foto
            }
        });

    } catch(error) {
        console.log("Erro login:", error);
        return res.status(500).json({
            error: "Erro interno no servidor"
        });
    }
});

// ✅ CORRIGIDO: removido o /aluno
// Atualizar foto
alunoRoute.put('/update-photo/id=:id', verificarJWT, async (req, res) => {
    try {
        const { foto } = req.body;

        const atualizado = await aluno.findOneAndUpdate(
            { _id: req.params.id },
            { foto },
            { new: true }
        );

        if (!atualizado) {
            return res.json({
                mensagem: "Aluno não encontrado"
            });
        }

        return res.json({
            mensagem: 'Foto atualizada com sucesso!',
            foto: atualizado.foto
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            mensagem: 'Erro na atualização!'
        });
    }
});

// ✅ CORRIGIDO: removido o /aluno
// Deletar aluno
alunoRoute.delete('/delete/id=:id', verificarJWT, async (req, res) => {
    try {
        const alunoExiste = await aluno.findOne({
            _id: req.params.id
        });

        if (!alunoExiste) {
            return res.json({
                mensagem: 'Aluno não existe!'
            });
        }

        await aluno.deleteOne({
            _id: req.params.id
        });

        return res.json({
            mensagem: 'Aluno removido com sucesso!'
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            mensagem: 'Erro na exclusão!'
        });
    }
});

// ✅ CORRIGIDO: removido o /aluno
// Atualizar senha
alunoRoute.put('/update-password', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const atualizado = await aluno.findOneAndUpdate(
            { email },
            { senha: senhaCriptografada },
            { new: true }
        );

        if (!atualizado) {
            return res.json({
                mensagem: 'Email não encontrado!'
            });
        }

        return res.json({
            mensagem: 'Senha atualizada com sucesso!'
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            mensagem: 'Erro na atualização!'
        });
    }
});

module.exports = alunoRoute;
