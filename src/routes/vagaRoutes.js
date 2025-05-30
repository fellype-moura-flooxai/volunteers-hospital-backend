const express = require('express')
const router = express.Router()
const connection = require('../db')

// Rota para criar uma nova vaga
router.post('/vagas', (req, res) => {
    const { titulo, descricao, data, requisitos, criado_por } = req.body

    if (!titulo || !descricao || !data || !criado_por) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' })
    }

    const query = 'INSERT INTO vagas (titulo, descricao, data, requisitos, criado_por) VALUES (?, ?, ?, ?, ?)'
    const valores = [titulo, descricao, data, requisitos, criado_por]

    connection.query(query, valores, (erro, resultado) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao criar vaga.', erro })
        }

        res.status(201).json({ mensagem: 'Vaga criada com sucesso!' })
    })
})

// Rota para listar todas as vagas
router.get('/vagas', (req, res) => {
    const query = 'SELECT * FROM vagas ORDER BY data DESC'

    connection.query(query, (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar vagas.', erro })
        }

        res.status(200).json(resultados)
    })
})

// Rota para excluir uma vaga ecandidaturas associadas
router.delete('/vagas/:id', (req, res) => {
    const { id } = req.params

    const excluirCandidaturas = 'DELETE FROM candidaturas WHERE vaga_id = ?'
    connection.query(excluirCandidaturas, [id], (erroCandidaturas) => {
        if (erroCandidaturas) {
            return res.status(500).json({ mensagem: 'Erro ao excluir candidaturas da vaga.', erro: erroCandidaturas })
        }

        const excluirVaga = 'DELETE FROM vagas WHERE id = ?'
        connection.query(excluirVaga, [id], (erroVaga, resultado) => {
            if (erroVaga) {
                return res.status(500).json({ mensagem: 'Erro ao excluir vaga.', erro: erroVaga })
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
            }

            res.status(200).json({ mensagem: 'Vaga e candidaturas associadas excluídas com sucesso.' })
        })
    })
})


module.exports = router