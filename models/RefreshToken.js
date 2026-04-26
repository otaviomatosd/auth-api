const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const RefreshToken = sequelize.define("RefreshToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "refresh_tokens",
  timestamps: true
});

module.exports = RefreshToken;