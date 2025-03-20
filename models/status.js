const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
    carro: {
        type: String,
        required: true,
    },
    placa: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Em andamento",
    },
    previsaoEntrega: {
        type: Date, // Campo "Date" para aceitar objetos do tipo Date no MongoDB
        required: true,
    },
    comentario: {
        type: String,
        required: false,
    },
});

// Criando o modelo
const Status = mongoose.model("Status", statusSchema);

module.exports = Status;
