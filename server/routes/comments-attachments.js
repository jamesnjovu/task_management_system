const express = require('express');
const {
    updateComment,
    deleteComment
} = require('../controllers/commentController');
const {
    downloadAttachment,
    deleteAttachment
} = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validators = require('../utils/validators');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Comment routes
router.put('/comments/:id', validate(validators.comment.create), updateComment);
router.delete('/comments/:id', deleteComment);

// Attachment routes
router.get('/attachments/:id/download', downloadAttachment);
router.delete('/attachments/:id', deleteAttachment);

module.exports = router;
