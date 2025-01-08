const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/controller');
const { authenticateJWT } = require('../middleware/authMiddleware');

const upload = multer(); 

router.post('/signup', upload.none(), authController.signup); 
router.post('/login', upload.none(), authController.login); 
router.get('/users', authenticateJWT, authController.getUsers); 
router.get('/messages', authenticateJWT, authController.getMessages); 
router.post('/messages', authenticateJWT, authController.sendMessage); 
router.post('/logout', authenticateJWT, authController.logout); 


module.exports = router;