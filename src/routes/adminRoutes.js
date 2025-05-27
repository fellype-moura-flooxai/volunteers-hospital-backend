const express = require('express');
const router = express.Router();
const connection = require('../db');

// Rota de login do administrador
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ? AND tipo_usuario = "admin"';
    connection.query(query, [email], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro no servidor.', erro });
        }

        if (resultados.length === 0) {
            return res.status(401).json({ mensagem: 'Email não encontrado.' });
        }

        const hospital = resultados[0];

        if (hospital.senha !== senha) {
            return res.status(401).json({ mensagem: 'Senha incorreta.' });
        }

        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            hospital: {
                id: hospital.id,
                nome: hospital.nome,
                email: hospital.email
            }
        });
    });
});

module.exports = router;
