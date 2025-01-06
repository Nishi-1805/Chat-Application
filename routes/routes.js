const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/controller');
const { authenticateJWT } = require('../middleware/authMiddleware');

const upload = multer(); 

router.post('/signup', upload.none(), authController.signup); 
router.post('/login', upload.none(), authController.login); 
router.post('/logout', authenticateJWT, authController.logout); 
router.get('/users', authenticateJWT, authController.getUsers); 
router.post('/messages', authenticateJWT, authController.sendMessage); 
router.get('/messages', authenticateJWT, authController.getMessages); 

module.exports = router;