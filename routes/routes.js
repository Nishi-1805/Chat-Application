const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/controller');

const upload = multer(); 

router.post('/signup', upload.none(), authController.signup); 
router.post('/login', upload.none(), authController.login); 

module.exports = router;