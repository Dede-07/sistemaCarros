const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Status = require("./models/status");
const path = require("path");
const moment = require("moment"); // Importando Moment.js para formatação

dotenv.config();
const app = express();
const port = process.env.PORT || 3000; // Ajuste para porta dinâmica no Vercel

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o MongoDB
mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }) // Timeout para evitar timeouts no Vercel
    .then(() => console.log("Conectado ao MongoDB!"))
    .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
        process.exit(1); // Finaliza o servidor em caso de erro crítico
    });

// Rota para exibir a página inicial com todos os status
app.get("/", async (req, res) => {
    try {
        const status = await Status.find();

        // Formatar a previsão de entrega no backend usando Moment.js
        const formattedStatus = status.map((item) => ({
            ...item._doc, // Inclui todos os dados do documento original
            previsaoEntrega: moment(item.previsaoEntrega).format("DD/MM/YYYY HH:mm"),
        }));

        res.render("index", { status: formattedStatus });
    } catch (err) {
        console.error("Erro ao buscar status:", err);
        res.status(500).json({ erro: err.message });
    }
});

// Rota para carregar a página do cliente (status.html) com dados formatados
app.get("/status.html", async (req, res) => {
    try {
        const status = await Status.find();

        // Formatar a previsão de entrega no backend para esta página também
        const formattedStatus = status.map((item) => ({
            ...item._doc, // Inclui todos os dados originais
            previsaoEntrega: moment(item.previsaoEntrega).format("DD/MM/YYYY HH:mm"),
        }));

        res.render("status", { status: formattedStatus });
    } catch (err) {
        console.error("Erro ao buscar status para a página do cliente:", err);
        res.status(500).json({ erro: err.message });
    }
});

// Rota para criar um novo status
app.post("/status", async (req, res) => {
    console.log("Recebendo dados do formulário:", req.body);

    const previsaoEntregaCompleta = moment(
        `${req.body.previsaoEntregaData} ${req.body.previsaoEntregaHora}`,
        "YYYY-MM-DD HH:mm"
    ).toDate();
    console.log("Previsão de entrega formatada como Date:", previsaoEntregaCompleta);

    const status = new Status({
        carro: req.body.carro,
        placa: req.body.placa,
        status: "Em andamento",
        previsaoEntrega: previsaoEntregaCompleta, // Agora é um Date
        comentario: req.body.comentario,
    });

    try {
        const savedStatus = await status.save();
        console.log("Status salvo com sucesso:", savedStatus);
        res.redirect("/");
    } catch (err) {
        console.error("Erro ao salvar status:", err);
        res.status(400).send("Erro ao salvar o status");
    }
});

// Rota para editar um status existente
app.get("/status/edit/:id", async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) {
            return res.status(404).json({ erro: "Status não encontrado" });
        }

        const statusData = await Status.find();
        res.render("update-status", { status: status, statusData: statusData });
    } catch (err) {
        console.error("Erro ao buscar status para edição:", err);
        res.status(500).json({ erro: err.message });
    }
});

// Rota para atualizar um status
app.post("/status/edit/:id", async (req, res) => {
    try {
        const updatedStatus = await Status.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.redirect("/");
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        res.status(400).send("Erro ao atualizar o status");
    }
});

// Rota para buscar o status de um carro pela placa
app.get("/status/placa/:placa", async (req, res) => {
    try {
        const status = await Status.findOne({ placa: req.params.placa });
        if (!status) {
            return res.status(404).json({ erro: "Status não encontrado para essa placa" });
        }

        // Formatar a previsão de entrega antes de enviar ao cliente
        const formattedStatus = {
            ...status._doc,
            previsaoEntrega: moment(status.previsaoEntrega).format("DD/MM/YYYY HH:mm"), // Formato humanizado
        };

        res.json(formattedStatus); // Enviar o status formatado
    } catch (err) {
        console.error("Erro ao buscar status por placa:", err);
        res.status(500).json({ erro: err.message });
    }
});

// Rota para excluir um status
app.post("/status/delete/:id", async (req, res) => {
    try {
        const status = await Status.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error("Erro ao deletar status:", err);
        res.status(400).send("Erro ao deletar o status");
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
