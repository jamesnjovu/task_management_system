// src/pages/TeamManagement/TeamMemberManagement.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiSettings, FiUserX, FiShield, FiUser, FiMail, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { getTeamById, getTeamMembers, getCurrentUserTeamRole, removeTeamMember } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddTeamMemberModal from '../../components/teams/AddTeamMemberModal';
import MemberRoleModal from '../../components/teams/MemberRoleModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const TeamMemberManagement = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const { currentUser } = useAuth();

    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [removingMember, setRemovingMember] = useState(false);

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const [teamResponse, membersResponse, roleResponse] = await Promise.all([
                getTeamById(teamId),
                getTeamMembers(teamId),
                getCurrentUserTeamRole(teamId)
            ]);
            setTeam(teamResponse.data);
            setMembers(membersResponse.data);
            setIsAdmin(roleResponse.data.role === 'admin');
        } catch (error) {
            console.error('Error fetching team data:', error);
            setAlert('Failed to load team data', 'error');
            navigate('/teams');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = () => {
        setShowAddModal(true);
    };

    const handleMemberAdded = () => {
        setShowAddModal(false);
        fetchTeamData();
        setAlert('Team member added successfully', 'success');
    };

    const handleRoleChange = (member) => {
        console.log('Changing role for member:', member);
        setSelectedMember(member);
        setShowRoleModal(true);
    };

    const handleRoleUpdated = () => {
        setShowRoleModal(false);
        fetchTeamData();
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
            fetchTeamData();
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

    const filteredMembers = members.filter(member => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            member.username.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            (member.first_name && member.first_name.toLowerCase().includes(searchLower)) ||
            (member.last_name && member.last_name.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
                <Link to={`/teams/${teamId}`} className="flex items-center text-gray-600 hover:text-gray-900">
                    <FiArrowLeft className="mr-2" />
                    Back to Team
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{team?.name} - Team Members</h1>
                <p className="text-gray-600 mt-1">{team?.description}</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Team Members ({members.length})</h2>

                    <div className="flex space-x-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {isAdmin && (
                            <Button
                                onClick={handleAddMember}
                                icon={<FiPlus />}
                                size="sm"
                            >
                                Add Member
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                {isAdmin && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        {searchQuery ? 'No members found matching search criteria.' : 'No members found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {member.avatar_url ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={member.avatar_url}
                                                        alt={member.username}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                                        {member.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {member.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {member.first_name && member.last_name ?
                                                            `${member.first_name} ${member.last_name}` :
                                                            '\u00A0'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <FiMail className="mr-2 text-gray-400" /> {member.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin'
                                                ? 'bg-primary-100 text-primary-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {member.role === 'admin' ? (
                                                    <>
                                                        <FiShield className="mr-1" /> Admin
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUser className="mr-1" /> Member
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(member.joined_at).toLocaleDateString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleRoleChange(member)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                    disabled={member.id === team.created_by}
                                                >
                                                    <FiSettings className="inline mr-1" /> Change Role
                                                </button>

                                                <button
                                                    onClick={() => handleRemoveMember(member)}
                                                    className="text-danger-600 hover:text-danger-900"
                                                    disabled={member.id === team.created_by}
                                                >
                                                    <FiUserX className="inline mr-1" /> Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddTeamMemberModal
                    teamId={teamId}
                    onClose={() => setShowAddModal(false)}
                    onMemberAdded={handleMemberAdded}
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

export default TeamMemberManagement;