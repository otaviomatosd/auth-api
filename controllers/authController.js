const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Senhas não conferem" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({ email, password: hash });

    res.status(201).json({ 
      message: "Usuário cadastrado com sucesso",
      user: { id: newUser.id, email: newUser.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({ 
      accessToken, 
      refreshToken,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token é obrigatório" });
    }

    const token = await RefreshToken.findOne({
      where: { 
        token: refreshToken,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!token) {
      return res.status(401).json({ error: "Refresh token inválido ou expirado" });
    }

    const user = await User.findByPk(token.userId);
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.id !== req.userId) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const { email, password } = req.body;
    const updateData = {};

    if (email) updateData.email = email;
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);
    
    res.json({ 
      message: "Usuário atualizado com sucesso",
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await RefreshToken.destroy({ where: { userId: req.userId } });
    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.id !== req.userId) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    await user.destroy();
    await RefreshToken.destroy({ where: { userId: req.params.id } });
    
    res.status(200).json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email não encontrado" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    
    await RefreshToken.create({
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000)
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: "Redefinição de senha",
      html: `
        <h2>Redefinição de Senha</h2>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este link expira em 1 hora.</p>
      `
    });

    res.json({ message: "Email de recuperação enviado!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Senhas não conferem" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    const resetToken = await RefreshToken.findOne({
      where: {
        token: token,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!resetToken) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await User.update(
      { password: hash },
      { where: { id: resetToken.userId } }
    );

    await resetToken.destroy();

    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  logout,
  deleteUser,
  forgotPassword,
  resetPassword
};