const express = require('express');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    reorderTasks
} = require('../controllers/taskController');
const {
    addComment,
    getTaskComments
} = require('../controllers/commentController');
const {
    uploadAttachment,
    getTaskAttachments
} = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validators = require('../utils/validators');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Task routes
router.post('/', validate(validators.task.create), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validate(validators.task.update), updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/status', validate(validators.task.updateStatus), updateTaskStatus);
router.put('/:id/assign', validate(validators.task.assignTask), assignTask);
router.put('/reorder', reorderTasks);

// Comment routes
router.post('/:taskId/comments', validate(validators.comment.create), addComment);
router.get('/:taskId/comments', getTaskComments);

// Attachment routes
router.post('/:taskId/attachments', uploadAttachment);
router.get('/:taskId/attachments', getTaskAttachments);

module.exports = router;
