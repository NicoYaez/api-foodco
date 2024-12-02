const jwt = require('jsonwebtoken');

const generateToken = (uid) => {
    const expiresIn = 60 * 60 * 24;

    try {
      const token = jwt.sign({ uid }, process.env.SECRET_API, {
        expiresIn,
      });

      return { token, expiresIn };
    } catch (error) {
      console.error(error);
      throw new Error('Error generating the token');
    }
};

module.exports = { generateToken };
