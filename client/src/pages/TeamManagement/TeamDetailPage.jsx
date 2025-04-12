import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { getTeamById, deleteTeam } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/common/Button';
import TeamMembersView from '../../components/teams/TeamMembersView';

const TeamDetailPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const [team, setTeam] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        fetchTeamDetails();
    }, [teamId]);

    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            const response = await getTeamById(teamId);
            setTeam(response.data);
            
            // Check if current user is an admin of this team
            setIsAdmin(response.data.role === 'admin');
        } catch (error) {
            console.error('Error fetching team details:', error);
            setAlert('Failed to load team details', 'error');
            navigate('/teams');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (window.confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
            try {
                await deleteTeam(teamId);
                setAlert('Team deleted successfully', 'success');
                navigate('/teams');
            } catch (error) {
                console.error('Error deleting team:', error);
                setAlert('Failed to delete team', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
                <Link to="/teams" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FiArrowLeft className="mr-2" />
                    Back to Teams
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                    {team.description && (
                        <p className="text-gray-600 mt-1">{team.description}</p>
                    )}
                </div>
                
                {isAdmin && (
                    <div className="flex space-x-2">
                        <Link to={`/teams/${teamId}/edit`}>
                            <Button
                                variant="outline"
                                icon={<FiEdit2 />}
                            >
                                Edit Team
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            icon={<FiTrash2 />}
                            onClick={handleDeleteTeam}
                        >
                            Delete Team
                        </Button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'details'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                            activeTab === 'members'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('members')}
                    >
                        <FiUsers className="mr-2" />
                        Members
                    </button>
                </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'details' ? (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Team Information</h3>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="mt-1">{team.name}</p>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="mt-1">{team.description || 'No description provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Your Role</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                    team.role === 'admin' 
                                        ? 'bg-primary-100 text-primary-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {team.role}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Actions</h3>
                            <div className="space-y-3">
                                <Link to={`/tasks/${teamId}`} className="block">
                                    <Button
                                        variant="primary"
                                        fullWidth
                                    >
                                        View Task Board
                                    </Button>
                                </Link>
                                <Link to={`/teams/${teamId}/members`}>
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        icon={<FiUsers />}
                                    >
                                        Manage Team Members
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <TeamMembersView 
                    teamId={teamId} 
                    isAdmin={isAdmin} 
                />
            )}
        </div>
    );
};

export default TeamDetailPage;