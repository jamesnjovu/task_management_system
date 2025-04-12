const express = require('express');
const {
    createTeam,
    getMyTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    getTeamStats,
    getCurrentUserRole,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validators = require('../utils/validators');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Team routes
router.post('/', validate(validators.team.create), createTeam);
router.get('/', getMyTeams);
router.get('/:id', getTeamById);
router.put('/:id', validate(validators.team.update), updateTeam);
router.delete('/:id', deleteTeam);
router.get('/:id/stats', getTeamStats);
router.get('/:id/role', getCurrentUserRole);

// Team member routes
router.get('/:id/members', getTeamMembers);
router.post('/:id/members', validate(validators.team.addMember), addTeamMember);
router.put('/:id/members/:userId', validate([
    { body: () => { return { role: ['admin', 'member'] } } }
]), updateMemberRole);
router.delete('/:id/members/:userId', removeTeamMember);

module.exports = router;
