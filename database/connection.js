const Sequelize = require("sequelize");

const sequelize = new Sequelize("user", "root", "anakin", {

    host:"localhost",
    dialect:"mysql"
});

sequelize.authenticate()
.then(() => {
    console.log("Banco Funcionando");
}).catch((err) => {
    console.log("Banco não está Funcionando", err);
});

module.exports = sequelize;