import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiX, FiUser, FiShield, FiUserX } from 'react-icons/fi';
import { getTeamMembers, updateMemberRole, removeTeamMember } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../common/Button';
import AddTeamMemberModal from './AddTeamMemberModal';

const TeamMembersView = ({ teamId, isAdmin = false }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { setAlert } = useAlert();

    useEffect(() => {
        fetchMembers();
    }, [teamId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getTeamMembers(teamId);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching team members:', error);
            setAlert('Failed to load team members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateMemberRole(teamId, userId, newRole);
            setAlert('Member role updated successfully', 'success');

            // Update the member's role in the state
            setMembers(members.map(member =>
                member.id === userId
                    ? { ...member, role: newRole }
                    : member
            ));
        } catch (error) {
            console.error('Error updating member role:', error);
            setAlert('Failed to update member role', 'error');
        }
    };

    const handleRemoveMember = async (userId, username) => {
        if (window.confirm(`Are you sure you want to remove ${username} from the team?`)) {
            try {
                await removeTeamMember(teamId, userId);
                setAlert('Member removed successfully', 'success');

                // Remove the member from the state
                setMembers(members.filter(member => member.id !== userId));
            } catch (error) {
                console.error('Error removing team member:', error);
                setAlert('Failed to remove team member', 'error');
            }
        }
    };

    const handleAddMember = (newMember) => {
        setShowAddModal(false);
        fetchMembers(); // Refresh the members list
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                {isAdmin && (
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<FiUserPlus />}
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Member
                    </Button>
                )}
            </div>

            <div className="px-4 py-4">
                {members.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No team members yet</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {members.map((member) => (
                            <li key={member.id} className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {member.avatar_url ? (
                                            <img
                                                className="h-10 w-10 rounded-full mr-3"
                                                src={member.avatar_url}
                                                alt={member.username}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white mr-3">
                                                {member.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{member.username}</h4>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin'
                                                ? 'bg-primary-100 text-primary-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.role === 'admin' ? <FiShield className="mr-1" /> : <FiUser className="mr-1" />}
                                            {member.role}
                                        </span>

                                        {isAdmin && (
                                            <div className="ml-4 flex">
                                                {/* Role toggle button (only visible to admins and for non-self) */}
                                                {member.role === 'member' && (
                                                    <button
                                                        onClick={() => handleRoleChange(member.id, 'admin')}
                                                        className="text-xs text-primary-600 hover:text-primary-900 mr-3"
                                                    >
                                                        Make Admin
                                                    </button>
                                                )}
                                                {member.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleRoleChange(member.id, 'member')}
                                                        className="text-xs text-gray-600 hover:text-gray-900 mr-3"
                                                    >
                                                        Remove Admin
                                                    </button>
                                                )}

                                                {/* Remove member button */}
                                                <button
                                                    onClick={() => handleRemoveMember(member.id, member.username)}
                                                    className="text-danger-600 hover:text-danger-900"
                                                >
                                                    <FiUserX className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showAddModal && (
                <AddTeamMemberModal
                    teamId={teamId}
                    onClose={() => setShowAddModal(false)}
                    onMemberAdded={handleAddMember}
                />
            )}
        </div>
    );
};

export default TeamMembersView;
