const express = require('express')
const router = express.Router()
const connection = require('../db')

// Rota para obter o ranking geral dos voluntários
router.get('/pontuacoes/ranking', (req, res) => {
    const query = `
    SELECT u.nome, p.pontos
    FROM pontuacoes p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE u.tipo_usuario = 'voluntario'
    ORDER BY p.pontos DESC
    LIMIT 20;
  `

    connection.query(query, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar ranking:', erro)
            return res.status(500).json({ erro: 'Erro ao buscar ranking.' })
        }

        res.status(200).json(resultados)
    })
})

// Rota para buscar pontuação de um voluntário
router.get('/pontuacoes/:usuario_id', (req, res) => {
    const { usuario_id } = req.params

    const query = 'SELECT pontos FROM pontuacoes WHERE usuario_id = ?'

    connection.query(query, [usuario_id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar pontuação:', err)
            return res.status(500).json({ erro: 'Erro ao buscar pontuação.' })
        }

        const pontos = results.length > 0 ? results[0].pontos : 0
        res.status(200).json({ pontos })
    })
})


module.exports = router