const jwt = require('jsonwebtoken');

const generateToken = (uid) => {
    const expiresIn = 60 * 60 * 24; // 24 hours

    try {
      const token = jwt.sign({ uid }, process.env.SECRET_API, {
        expiresIn,
      });

      return { token, expiresIn }; // Returns the token and expiration time
    } catch (error) {
      console.error(error);
      throw new Error('Error generating the token');
    }
};

module.exports = { generateToken };
