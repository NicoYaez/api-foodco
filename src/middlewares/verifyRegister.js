//const { RolesActivos } = require("../models/role");
const User = require("../models/user");

const checkRegisterUser = async (req, res, next) => {
    const emailBody = req.body.email.toLowerCase();
    const user = await User.findOne({ username: req.body.username })

    if (user) return res.status(400).json({ message: "El usuario ya existe" })

    const email = await User.findOne({ email: emailBody })

    if (email) return res.status(400).json({ message: "El email ya existe" })
    
    next();
};
module.exports = {
    checkRegisterUser
  };