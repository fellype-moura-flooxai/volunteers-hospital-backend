const express = require('express');
const cors = require('cors');
const users = require('./src/routes/userRoutes')
const vagaRoutes = require('./src/routes/vagaRoutes')
const candidaturaRoutes = require('./src/routes/candidaturaRoutes')
const pontuacoesRoutes = require('./src/routes/pontuacoesRoutes')

require('./src/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', users);
app.use('/', vagaRoutes)
app.use('/', candidaturaRoutes)
app.use('/', pontuacoesRoutes)

app.get('/', (req, res) => {
  res.send('servidor rodando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});