const express = require('express');
const { updateProfile, getMyTasks, getUserById, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validators = require('../utils/validators');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.put('/profile', validate(validators.user.update), updateProfile);
router.get('/tasks', getMyTasks);
router.get('/:id', getUserById);
router.get('/search', searchUsers);


module.exports = router;
