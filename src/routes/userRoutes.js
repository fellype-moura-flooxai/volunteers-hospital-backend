const express = require('express')
const router = express.Router()
const connection = require('../db')
const jwt = require('jsonwebtoken')


//rota de Cadastro voluntario
router.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
  }

  const query = 'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)'
  const valores = [nome, email, senha, 'voluntario'];

  connection.query(query, valores, (erro, resultado) => {
    if (erro) {
      if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensagem: 'Email já está cadastrado.' })
      }
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.', erro })
    }

    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' })
  });
});

// Rota de login admin ou voluntario
router.post('/login', (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' })
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?'
  connection.query(query, [email], (erro, resultados) => {
    if (erro) {
      return res.status(500).json({ mensagem: 'Erro no servidor.', erro })
    }

    if (resultados.length === 0) {
      return res.status(401).json({ mensagem: 'Email não encontrado.' })
    }

    const usuario = resultados[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({ mensagem: 'Senha incorreta.' })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo_usuario
      },
      'chave_secreta', // depois colocar em variável de ambiente
      { expiresIn: '2h' }
    );

    // Resposta com token e dados do usuário
    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      tipo_usuario: usuario.tipo_usuario,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })
  })
})

module.exports = router
