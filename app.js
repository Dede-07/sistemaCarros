// Importa as dependências necessárias
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Configura o dotenv para usar variáveis de ambiente
dotenv.config();

const app = express();

// Conectar ao banco de dados (MongoDB)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oficina', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Banco de dados conectado!'))
    .catch(err => console.error('Erro de conexão ao banco:', err));

// Configurar o caminho das views (arquivos EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Definir a pasta para arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal - Página de início
app.get('/', (req, res) => {
    res.render('index');  // Renderiza a página 'index.ejs'
});

// Roda o servidor na porta 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
