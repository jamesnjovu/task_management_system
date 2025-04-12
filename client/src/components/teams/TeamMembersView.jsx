import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiX, FiUser, FiShield, FiUserX, FiUsers, FiArrowRight } from 'react-icons/fi';
import { getTeamMembers, updateMemberRole, removeTeamMember } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../common/Button';
import AddTeamMemberModal from './AddTeamMemberModal';
import MemberRoleModal from './MemberRoleModal';
import ConfirmModal from '../common/ConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';

const TeamMembersView = ({ teamId, isAdmin = false }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [removingMember, setRemovingMember] = useState(false);
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

    const handleRoleChange = (member) => {
        setSelectedMember(member);
        setShowRoleModal(true);
    };

    const handleRoleUpdated = () => {
        setShowRoleModal(false);
        fetchMembers();
        setAlert('Member role updated successfully', 'success');
    };

    const handleRemoveMember = (member) => {
        setSelectedMember(member);
        setShowRemoveModal(true);
    };

    const confirmRemoveMember = async () => {
        if (!selectedMember) return;
        
        setRemovingMember(true);
        try {
            await removeTeamMember(teamId, selectedMember.id);
            setShowRemoveModal(false);
            fetchMembers();
            setAlert('Member removed successfully', 'success');
        } catch (error) {
            console.error('Error removing team member:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to remove team member. Please try again.';

            setAlert(errorMessage, 'error');
        } finally {
            setRemovingMember(false);
            setSelectedMember(null);
        }
    };

    const handleAddMember = (newMember) => {
        setShowAddModal(false);
        fetchMembers(); // Refresh the members list
        setAlert('Team member added successfully', 'success');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="medium" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <div className="flex space-x-2">
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
                    <Link to={`/teams/${teamId}/members`}>
                        <Button
                            variant="outline"
                            size="sm"
                            icon={<FiUsers />}
                        >
                            View All <FiArrowRight className="ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="px-4 py-4">
                {members.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No team members yet</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {/* Show only first 5 members */}
                        {members.slice(0, 5).map((member) => (
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                member.role === 'admin'
                                                    ? 'bg-primary-100 text-primary-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.role === 'admin' ? <FiShield className="mr-1" /> : <FiUser className="mr-1" />}
                                            {member.role}
                                        </span>

                                        {isAdmin && (
                                            <div className="ml-4 flex">
                                                {/* Role toggle button (only visible to admins and for non-self) */}
                                                <button
                                                    onClick={() => handleRoleChange(member)}
                                                    className="text-primary-600 hover:text-primary-900 mr-3"
                                                >
                                                    Change Role
                                                </button>
                                                
                                                {/* Remove member button */}
                                                <button
                                                    onClick={() => handleRemoveMember(member)}
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

                        {/* Show a link to view all if there are more than 5 members */}
                        {members.length > 5 && (
                            <li className="py-4 text-center">
                                <Link 
                                    to={`/teams/${teamId}/members`}
                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    View all {members.length} members <FiArrowRight className="inline ml-1" />
                                </Link>
                            </li>
                        )}
                    </ul>
                )}
                    <ul className="divide-y divide-gray-200">
                        {/* Show only first 5 members */}
                        {members.slice(0, 5).map((member) => (
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                member.role === 'admin'
                                                    ? 'bg-primary-100 text-primary-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.role === 'admin' ? <FiShield className="mr-1" /> : <FiUser className="mr-1" />}
                                            {member.role}
                                        </span>

                                        {isAdmin && (
                                            <div className="ml-4 flex">
                                                {/* Role toggle button (only visible to admins and for non-self) */}
                                                <button
                                                    onClick={() => handleRoleChange(member)}
                                                    className="text-primary-600 hover:text-primary-900 mr-3"
                                                >
                                                    Change Role
                                                </button>
                                                
                                                {/* Remove member button */}
                                                <button
                                                    onClick={() => handleRemoveMember(member)}
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

                        {/* Show a link to view all if there are more than 5 members */}
                        {members.length > 5 && (
                            <li className="py-4 text-center">
                                <Link 
                                    to={`/teams/${teamId}/members`}
                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    View all {members.length} members <FiArrowRight className="inline ml-1" />
                                </Link>
                            </li>
                        )}
                    </ul>
                )}
            </div>
            
            {/* Modals */}
            {showAddModal && (
                <AddTeamMemberModal
                    teamId={teamId}
                    onClose={() => setShowAddModal(false)}
                    onMemberAdded={handleAddMember}
                />
            )}
            
            {showRoleModal && selectedMember && (
                <MemberRoleModal
                    teamId={teamId}
                    member={selectedMember}
                    onClose={() => setShowRoleModal(false)}
                    onRoleUpdated={handleRoleUpdated}
                />
            )}
            
            {showRemoveModal && selectedMember && (
                <ConfirmModal
                    title="Remove Team Member"
                    message={`Are you sure you want to remove ${selectedMember.username} from the team? This action cannot be undone.`}
                    confirmText="Remove"
                    confirmVariant="danger"
                    onConfirm={confirmRemoveMember}
                    onCancel={() => setShowRemoveModal(false)}
                    isLoading={removingMember}
                />
            )}
        </div>
    );
};

export default TeamMembersView;
