const express = require('express');
const cors = require('cors');
const users = require('./src/routes/userRoutes')

require('./src/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', users);

app.get('/', (req, res) => {
    res.send('servidor rodando');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});