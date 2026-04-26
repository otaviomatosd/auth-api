require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const sequelize = require("./database/connection");
const User = require("./models/User");
const RefreshToken = require("./models/RefreshToken");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com banco estabelecida");
    
    await User.sync({ force: false });
    await RefreshToken.sync({ force: false });
    console.log(" Tabelas sincronizadas");
    
    app.listen(3000, () => {
      console.log(" Server rodando");
    });
  } catch (error) {
    console.error(" Erro ao iniciar servidor:", error);
  }
}

startServer();