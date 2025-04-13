import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiList } from 'react-icons/fi';
import { getMyTeams, deleteTeam } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/common/Button';
import CreateTeamModal from '../../components/teams/CreateTeamModal';
import EditTeamModal from '../../components/teams/EditTeamModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { setAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await getMyTeams();
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setAlert('Failed to load teams', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (newTeam) => {
        setShowCreateModal(false);
        await fetchTeams();
        setAlert('Team created successfully!', 'success');
    };

    const handleEditTeam = (team) => {
        setSelectedTeam(team);
        setShowEditModal(true);
    };

    const handleTeamUpdated = (updatedTeam) => {
        setTeams(teams.map(team =>
            team.id === updatedTeam.id ? { ...team, ...updatedTeam } : team
        ));
        setShowEditModal(false);
        setSelectedTeam(null);
        setAlert('Team updated successfully!', 'success');
    };

    const handleOpenDeleteConfirm = (team, e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete button
        setSelectedTeam(team);
        setShowDeleteConfirm(true);
    };

    const handleDeleteTeam = async () => {
        if (!selectedTeam) return;

        setIsDeleting(true);
        try {
            await deleteTeam(selectedTeam.id);
            setTeams(teams.filter(team => team.id !== selectedTeam.id));
            setAlert('Team deleted successfully!', 'success');
            setShowDeleteConfirm(false);
            setSelectedTeam(null);
        } catch (error) {
            console.error('Error deleting team:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to delete team. Please try again.';

            setAlert(errorMessage, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const navigateToTeamDetail = (teamId) => {
        navigate(`/teams/${teamId}`);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    icon={<FiPlus />}
                >
                    Create Team
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="medium" />
                </div>
            ) : teams.length === 0 ? (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
                    <p className="text-gray-600 mb-4">
                        Create your first team to start collaborating on tasks.
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        icon={<FiPlus />}
                    >
                        Create Team
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigateToTeamDetail(team.id)}
                        >
                            <div className="p-5">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {team.name}
                                </h3>
                                {team.description && (
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {team.description}
                                    </p>
                                )}
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <FiUsers className="mr-1" />
                                    <span>Role: {team.role}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/tasks/${team.id}`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FiList className="mr-1" />
                                        Tasks
                                    </Link>
                                    <Link
                                        to={`/teams/${team.id}/members`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FiUsers className="mr-1" />
                                        Members
                                    </Link>

                                    {team.role === 'admin' && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTeam(team);
                                                }}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <FiEdit2 className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleOpenDeleteConfirm(team, e)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-danger-700 bg-white hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500"
                                            >
                                                <FiTrash2 className="mr-1" />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {showCreateModal && (
                        <CreateTeamModal
                            onClose={() => setShowCreateModal(false)}
                            onCreateTeam={handleCreateTeam}
                        />
                    )}

                    {showEditModal && selectedTeam && (
                        <EditTeamModal
                            team={selectedTeam}
                            onClose={() => {
                                setShowEditModal(false);
                                setSelectedTeam(null);
                            }}
                            onTeamUpdated={handleTeamUpdated}
                        />
                    )}

                    {showDeleteConfirm && selectedTeam && (
                        <ConfirmModal
                            title="Delete Team"
                            message={`Are you sure you want to delete the team "${selectedTeam.name}"? This action cannot be undone.`}
                            confirmText="Delete"
                            confirmVariant="danger"
                            onConfirm={handleDeleteTeam}
                            onCancel={() => {
                                setShowDeleteConfirm(false);
                                setSelectedTeam(null);
                            }}
                            isLoading={isDeleting}
                        />
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreateTeam={handleCreateTeam}
                />
            )}
        </div>
    );
};

export default TeamManagement;