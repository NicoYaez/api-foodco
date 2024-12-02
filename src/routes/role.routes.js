const express = require('express');
const router = express.Router();
const roleController = require("../controllers/role.controller");

router.post('/new', roleController.createRole);

router.get('/list', roleController.getRoles);

router.get('/:id', roleController.getRoleById);

router.put('/update/:id', roleController.updateRole);

router.delete('/delete/:id', roleController.deleteRole);

module.exports = router;
