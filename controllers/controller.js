const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../sqlconnection');
require('dotenv').config();

// Signup Controller
exports.signup = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!password) {
        return res.status(400).send('Password is required');
    }

    connection.query('SELECT * FROM chatUsers WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            return res.status(400).send('Email ID already registered');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser  = { name, email, phone, password: hashedPassword };

            connection.query('INSERT INTO chatUsers SET ?', newUser , (err, results) => {
                if (err) {
                    console.error('Error saving user:', err);
                    return res.status(500).send('Internal server error');
                }
                res.redirect('/login');
            });
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).send('Internal server error');
        }
    });
};

// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM chatUsers WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(404).send('User  not found');
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('User  not authorized');
        }

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
      // Insert user into activeUsers table
      connection.query('INSERT INTO activeUsers (userId) VALUES (?) ON DUPLICATE KEY UPDATE loginTime = CURRENT_TIMESTAMP', [user.id], (err) => {
        if (err) {
            console.error('Error inserting into activeUsers:', err);
            return res.status(500).send('Internal server error');
        }
        res.json({ token });
    });
});
};

// Logout Controller
exports.logout = (req, res) => {
    const userId = req.user.id; 

    connection.query('DELETE FROM activeUsers WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error logging out user:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Logged out successfully');
    });
};

// Fetch Active Users Controller
exports.getUsers = (req, res) => {
    connection.query('SELECT id, name FROM chatUsers', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results); // Send back all users
    });
};

// Send Message Controller
exports.sendMessage = (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; 
    const newMessage = { userId, message, timestamp: new Date() };
    connection.query('INSERT INTO messages SET ?', newMessage, (err) => {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Message sent');
    });
};

// Fetch All Messages Controller
exports.getMessages = (req, res) => {
    connection.query('SELECT messages.id, messages.message, messages.timestamp, chatUsers.name FROM messages JOIN chatUsers ON messages.userId = chatUsers.id ORDER BY messages.timestamp ASC', (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results); 
    });
};

// Create Group
exports.createGroup = (req, res) => {
    const { name } = req.body;
    const userId = req.user.id; // Get the ID of the user creating the group

    // Use backticks to escape the Groups table name
    connection.query('INSERT INTO `Groups` (name, admin_id) VALUES (?, ?)', [name, userId], (err, results) => {
        if (err) {
            console.error('Error creating group:', err);
            return res.status(500).send('Internal server error');
        }
        const groupId = results.insertId;
        // Automatically add the creator to the group
        connection.query('INSERT INTO GroupMembers (group_id, user_id) VALUES (?, ?)', [groupId, userId], (err) => {
            if (err) {
                console.error('Error adding user to group:', err);
                return res.status(500).send('Internal server error');
            }
            res.status(201).json({ groupId, name });
        });
    });
};

// Invite Users to Group
exports.inviteUsersToGroup = (req, res) => {
    const groupId = req.params.groupId;
    const userIds = req.body.userIds; // Array of user IDs to invite

    // Insert each user into the GroupInvitations table
    const queries = userIds.map(userId => {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO GroupInvitations (group_id, user_id) VALUES (?, ?)', [groupId, userId], (err) => {
                if (err) {
                    console.error('Error inviting user to group:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(queries)
        .then(() => res.status(200).send('Users invited successfully'))
        .catch(() => res.status(500).send('Internal server error'));
};

// Fetch User Invitations
exports.fetchUserInvitations = (req, res) => {
    const userId = req.user.id; // Get the user ID from the authenticated user

    connection.query('SELECT gi.id, g.name AS group_name FROM GroupInvitations gi JOIN `Groups` g ON gi.group_id = g.id WHERE gi.user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching invitations:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results); // Send back the invitations
    });
};

// Accept Invitation
exports.acceptInvitation = (req, res) => {
    const invitationId = req.params.id; 
    const userId = req.user.id; // Get the user ID from the authenticated user

    // First, find the group ID from the invitation
    connection.query('SELECT group_id FROM GroupInvitations WHERE id = ? AND user_id = ?', [invitationId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching invitation:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Invitation not found');
        }

        const groupId = results[0].group_id;

        // Add the user to the GroupMembers table
        connection.query('INSERT INTO GroupMembers (group_id, user_id) VALUES (?, ?)', [groupId, userId], (err) => {
            if (err) {
                console.error('Error adding user to group:', err);
                return res.status(500).send('Internal server error');
            }

            // Remove the invitation
            connection.query('DELETE FROM GroupInvitations WHERE id = ?', [invitationId], (err) => {
                if (err) {
                    console.error('Error deleting invitation:', err);
                    return res.status(500).send('Internal server error');
                }
                res.send('Invitation accepted successfully');
            });
        });
    });
};

// Reject Invitation
exports.rejectInvitation = (req, res) => {
    const invitationId = req.params.id; // Get the invitation ID from the request parameters

    connection.query('DELETE FROM GroupInvitations WHERE id = ?', [invitationId], (err, result) => {
        if (err) {
            console.error('Error rejecting invitation:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Invitation rejected successfully');
    });
};

// Leave Group
exports.leaveGroup = (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    connection.query('DELETE FROM GroupMembers WHERE group_id = ? AND user_id = ?', [groupId, userId], (err) => {
        if (err) {
            console.error('Error leaving group:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Left group successfully');
    });
};

// Get User Groups
exports.getUserGroups = (req, res) => {
    const userId = req.user.id;

    connection.query(`
        SELECT g.id, g.name, 
               (SELECT COUNT(*) FROM GroupMembers gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS isMember,
               CASE WHEN g.admin_id = ? THEN 1 ELSE 0 END AS isAdmin
        FROM \`Groups\` g 
        JOIN GroupMembers gm ON g.id = gm.group_id 
        WHERE gm.user_id = ?`, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching user groups:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
};

// Send Group Message
exports.sendGroupMessage = (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; 
    const group_id = req.params.groupId;

    connection.query('INSERT INTO GroupMessages (group_id, user_id, message, timestamp) VALUES (?, ?, ?, NOW())', [group_id, userId, message], (err) => {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Message sent successfully');
    });
};

// Get Group Messages
exports.getGroupMessages = (req, res) => {
    const groupId = req.params.groupId;

    connection.query('SELECT GroupMessages.id, GroupMessages.message, GroupMessages.timestamp, chatUsers.name FROM GroupMessages JOIN chatUsers ON GroupMessages.user_id = chatUsers.id WHERE GroupMessages.group_id = ? ORDER BY GroupMessages.timestamp ASC', [groupId], (err, results) => {
        if (err) {
            console.error('Error fetching group messages:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
};