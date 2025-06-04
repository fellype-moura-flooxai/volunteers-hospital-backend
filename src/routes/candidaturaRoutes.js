const express = require('express')
const router = express.Router()
const connection = require('../db')

// Rota para cadastrar candidatura
router.post('/candidaturas', (req, res) => {
  console.log('Corpo recebido:', req.body)
  const { usuario_id, vaga_id, status } = req.body

  if (!usuario_id || !vaga_id) {
    return res.status(400).json({ erro: 'Dados incompletos.' })
  }

  const query = 'INSERT INTO candidaturas (usuario_id, vaga_id, status) VALUES (?, ?, ?)'
  connection.query(query, [usuario_id, vaga_id, status || 'pendente'], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Você já se candidatou a esta vaga.' })
      }

      console.error('Erro ao inserir candidatura:', err)
      return res.status(500).json({ erro: 'Erro ao se candidatar' })
    }

    res.status(201).json({ mensagem: 'Candidatura registrada com sucesso!' })
  })
})

// Rota para listar as candidaturas de um usuário
router.get('/candidaturas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const query = `
    SELECT 
      c.id AS candidatura_id,
      v.titulo,
      v.data,
      c.status
    FROM candidaturas c
    JOIN vagas v ON c.vaga_id = v.id
    WHERE c.usuario_id = ?
    ORDER BY v.data DESC
  `;

  connection.query(query, [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar candidaturas:', err);
      return res.status(500).json({ erro: 'Erro ao buscar candidaturas.' })
    }

    res.status(200).json(results)
  });
});

// Rota para cancelar candidatura
router.delete('/candidaturas/:id', (req, res) => {
  const candidaturaId = req.params.id
  const { usuario_id } = req.body

  if (!usuario_id) {
    return res.status(400).json({ erro: 'Usuário não autenticado.' })
  }

  const verificaQuery = 'SELECT * FROM candidaturas WHERE id = ? AND usuario_id = ?'
  connection.query(verificaQuery, [candidaturaId, usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao verificar candidatura:', err)
      return res.status(500).json({ erro: 'Erro interno ao verificar candidatura.' })
    }

    if (results.length === 0) {
      return res.status(403).json({ erro: 'Candidatura não encontrada ou não pertence a este usuário.' })
    }

    const deleteQuery = 'DELETE FROM candidaturas WHERE id = ?'
    connection.query(deleteQuery, [candidaturaId], (err, result) => {
      if (err) {
        console.error('Erro ao cancelar candidatura:', err)
        return res.status(500).json({ erro: 'Erro ao cancelar a candidatura.' })
      }

      res.status(200).json({ mensagem: 'Candidatura cancelada com sucesso.' })
    });
  });
});

// Rota para atualizar o status de uma candidatura
router.put('/candidaturas/:id', (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ erro: 'Status é obrigatório.' })
  }

  const query = 'UPDATE candidaturas SET status = ? WHERE id = ?'
  connection.query(query, [status, id], (err, resultado) => {
    if (err) {
      console.error('Erro ao atualizar status:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar status.' })
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Candidatura não encontrada.' })
    }

    res.status(200).json({ mensagem: 'Status atualizado com sucesso.' })
  })
})

// Rota para concluir uma candidatura e adicionar pontos
router.put('/candidaturas/:id/concluir', (req, res) => {
  const { id } = req.params

  const verificarQuery = 'SELECT id, usuario_id, status FROM candidaturas WHERE id = ?'
  connection.query(verificarQuery, [id], (erro, resultados) => {
    if (erro) {
      console.error('Erro ao verificar candidatura:', erro)
      return res.status(500).json({ erro: 'Erro interno ao verificar candidatura.' })
    }

    if (resultados.length === 0) {
      return res.status(404).json({ erro: 'Candidatura não encontrada.' })
    }

    const candidatura = resultados[0]

    if (candidatura.status === 'concluida') {
      return res.status(400).json({ erro: 'Candidatura já foi concluída.' })
    }

    const marcarConcluidaQuery = 'UPDATE candidaturas SET status = "concluida" WHERE id = ?'
    connection.query(marcarConcluidaQuery, [id], (erroAtualizar) => {
      if (erroAtualizar) {
        console.error('Erro ao marcar como concluída:', erroAtualizar)
        return res.status(500).json({ erro: 'Erro ao concluir candidatura.' })
      }

      const pontos = 10
      const atualizarPontuacao = `
        INSERT INTO pontuacoes (usuario_id, pontos)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE pontos = pontos + VALUES(pontos)`

      connection.query(atualizarPontuacao, [candidatura.usuario_id, pontos], (erroPontuacao) => {
        if (erroPontuacao) {
          console.error('Erro ao adicionar pontuação:', erroPontuacao)
          return res.status(500).json({ erro: 'Erro ao adicionar pontuação.' })
        }

        res.status(200).json({ mensagem: 'Candidatura concluída e pontos adicionados com sucesso!' })
      })
    })
  })
})

module.exports = router