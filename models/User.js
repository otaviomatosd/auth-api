const {DataTypes} = require("sequelize");
const sequelize = require("../database/connection.js");

 const user = sequelize.define("user", {
    email: {
        type:DataTypes.STRING,
        allowNull: false
    },
    password: {
        type:DataTypes.STRING,
        allowNull: false
    } 
 });

 user.sync({force: false})
 .then(() => {
    console.log("Tabela Criada");
 }).catch((err) => {
    console.log("Tabela não foi criada", err);
 });

 module.exports = user;