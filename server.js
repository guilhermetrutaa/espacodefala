const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Para servir arquivos estáticos

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// Lista de temas
const temas = [
    "De quem você sente mais falta?",
    "Qual é seu maior sonho?",
    "O que te faz feliz?",
    "Do que você tem medo?",
    "O que te traz orgulho?"
];

// Função para obter o tema do dia
const temaAtual = () => temas[new Date().getDate() % temas.length];

// Array para armazenar as respostas
let respostas = [];

// Conexão com o Socket.IO
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    // Enviar o tema do dia para o cliente
    socket.emit('tema_atual', temaAtual());

    // Enviar todas as respostas para o cliente
    socket.emit('respostas', respostas);

    // Receber nova resposta do cliente
    socket.on('nova_resposta', (resposta) => {
        respostas.push({ texto: resposta, likes: 0, estrelas: 0 });
        io.emit('respostas', respostas); // Atualizar para todos
    });

    // Receber "curtir" ou "estrelar" de uma resposta
    socket.on('interagir_resposta', ({ index, tipo }) => {
        if (tipo === 'like') respostas[index].likes++;
        if (tipo === 'estrela') respostas[index].estrelas++;
        io.emit('respostas', respostas); // Atualizar para todos
    });
});

// Iniciar o servidor
server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
