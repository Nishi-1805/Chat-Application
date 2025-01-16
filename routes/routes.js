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

// User Search Route
router.get('/users/search', authenticateJWT, authController.searchUsers);

// Group routes
router.post('/groups', authenticateJWT, authController.createGroup); 
router.post('/groups/:groupId/invite', authenticateJWT, authController.inviteUsersToGroup); 
router.post('/groups/:groupId/promote', authenticateJWT, authController.promoteUserToAdmin); 
router.delete('/groups/:groupId/remove', authenticateJWT, authController.removeUserFromGroup); 
router.get('/groups/:groupId/members', authenticateJWT, authController.fetchGroupMembers);
router.get('/invitations', authenticateJWT, authController.fetchUserInvitations);
router.post('/invitations/:id/accept', authenticateJWT, authController.acceptInvitation);
router.delete('/invitations/:id/reject', authenticateJWT, authController.rejectInvitation);
router.post('/groups/:groupId/leave', authenticateJWT, authController.leaveGroup); 
router.get('/groups', authenticateJWT, authController.getUserGroups); 
router.post('/groups/:groupId/messages', authenticateJWT, authController.sendGroupMessage); 
router.get('/groups/:groupId/messages', authenticateJWT, authController.getGroupMessages); 

module.exports = router;