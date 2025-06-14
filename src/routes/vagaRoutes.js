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

// Rota para buscar uma vaga por ID
router.get('/vagas/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM vagas WHERE id = ?';
    connection.query(query, [id], (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar vaga.', erro });
        if (resultados.length === 0) return res.status(404).json({ mensagem: 'Vaga não encontrada.' });
        res.status(200).json(resultados[0]);
    });
});

// Rota para atualizar vaga
router.put('/vagas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, requisitos, data } = req.body;
    const query = 'UPDATE vagas SET titulo = ?, descricao = ?, requisitos = ?, data = ? WHERE id = ?'
    connection.query(query, [titulo, descricao, requisitos, data, id], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao atualizar vaga.', erro })
        res.status(200).json({ mensagem: 'Vaga atualizada com sucesso!' })
    })
})

// Rota para listar candidaturas de uma vaga específica
router.get('/vagas/:id/candidaturas', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            c.id AS candidatura_id,
            c.status,
            c.data_candidatura,
            c.concluida,
            u.id AS usuario_id,
            u.nome,
            u.email
        FROM candidaturas c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.vaga_id = ?
    `;

    connection.query(query, [id], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar candidaturas.', erro });
        }

        res.status(200).json(resultados)
    })
})


module.exports = router