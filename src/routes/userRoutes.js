const express = require('express');
const router = express.Router();
const connection = require('../db');

// Rota de login admin ou voluntario
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro no servidor.', erro });
        }

        if (resultados.length === 0) {
            return res.status(401).json({ mensagem: 'Email não encontrado.' });
        }

        const usuario = resultados[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ mensagem: 'Senha incorreta.' });
        }

        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            tipo_usuario: usuario.tipo_usuario,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    });
});

module.exports = router;
