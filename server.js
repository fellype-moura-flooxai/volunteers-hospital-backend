const express = require('express');

require('./src/db');

const app = express();

app.use(express.json());

const usuarios = [];

app.get('/', (req, res) => {
    res.send('servidor rodando');
});

app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    if (nome === "" || email === "" || senha === "") {
        return res.send('Todos os campos São obrigatorios!');
    }
    
    const novoUsuario = {
        id: usuarios.length + 1,
        nome: nome,
        email: email,
        senha: senha
    };

    usuarios.push(novoUsuario);

    console.log('Usuarios cadastrados até agora:', usuarios);

    res.send('Usuário cadastrado com sucesso!');
});

app.get('/usuarios', (req, res) => {
    res.send(usuarios);
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.send('Email e senha são obrigatórios!');
    }
    
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario) {
        return res.send('Usuário não encontrado!');
    }
    
    if (usuario.senha !== senha) {
        return res.send('Senha incorreta!');
    }
    
    res.send(`Login realizado com sucesso! Bem-vindo, ${usuario.nome}.`);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});