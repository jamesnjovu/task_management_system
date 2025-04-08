import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiList, FiPlus, FiX } from 'react-icons/fi';
import { getMyTeams } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import CreateTeamModal from '../teams/CreateTeamModal';

const Sidebar = () => {
    const location = useLocation();
    const { setAlert } = useAlert();
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

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
        setShowModal(false);
        await fetchTeams();
        setAlert('Team created successfully!', 'success');
    };

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
            ? 'bg-primary-100 text-primary-900'
            : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <>
            <div
                className={`md:block fixed inset-0 z-20 transition-opacity bg-gray-600 bg-opacity-75 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    } md:hidden`}
                onClick={() => setIsOpen(false)}
            ></div>

            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform transition-transform md:translate-x-0 md:relative md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 md:hidden">
                    <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                    <button
                        type="button"
                        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <div className="h-0 flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                    <nav className="flex-1 px-2 space-y-1">
                        <NavLink to="/dashboard" className={navLinkClasses}>
                            <FiHome className="mr-3 h-5 w-5 text-gray-500" />
                            Dashboard
                        </NavLink>

                        <NavLink to="/teams" className={navLinkClasses}>
                            <FiUsers className="mr-3 h-5 w-5 text-gray-500" />
                            Teams
                        </NavLink>

                        <div className="mt-6">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Your Teams
                            </h3>

                            <div className="mt-2 space-y-1">
                                {loading ? (
                                    <div className="px-4 py-2 text-sm text-gray-600">Loading teams...</div>
                                ) : teams.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-gray-600">No teams yet</div>
                                ) : (
                                    teams.map((team) => (
                                        <NavLink
                                            key={team.id}
                                            to={`/tasks/${team.id}`}
                                            className={navLinkClasses}
                                        >
                                            <FiList className="mr-3 h-5 w-5 text-gray-500" />
                                            {team.name}
                                        </NavLink>
                                    ))
                                )}

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md group"
                                >
                                    <FiPlus className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
                                    Create Team
                                </button>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {showModal && (
                <CreateTeamModal
                    onClose={() => setShowModal(false)}
                    onCreateTeam={handleCreateTeam}
                />
            )}
        </>
    );
};

export default Sidebar;
