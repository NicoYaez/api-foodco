const express = require("express");
const router = express.Router();

const verifyController = require('../controllers/verify.controller');
const authJwt = require("../middlewares/auth.jwt");

router.get('/:id', verifyController.verifyController);

module.exports = router;
