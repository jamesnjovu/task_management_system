import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { getMyTeams, deleteTeam } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/common/Button';
import CreateTeamModal from '../../components/teams/CreateTeamModal';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { setAlert } = useAlert();

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

    const handleDeleteTeam = async (teamId, teamName) => {
        if (window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
            try {
                await deleteTeam(teamId);
                setTeams(teams.filter(team => team.id !== teamId));
                setAlert('Team deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting team:', error);
                const errorMessage =
                    error.response?.data?.message ||
                    'Failed to delete team. Please try again.';

                setAlert(errorMessage, 'error');
            }
        }
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
                    <div className="loading-spinner" />
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
                            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
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
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/tasks/${team.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            View Tasks
                                        </Link>
                                        <Link
                                            to={`/teams/${team.id}/members`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            <FiUsers className="mr-1" />
                                            Members
                                        </Link>
                                    </div>
                                    {team.role === 'admin' && (
                                        <>
                                            <Link
                                                to={`/teams/${team.id}/edit`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <FiEdit2 className="mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteTeam(team.id, team.name)}
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