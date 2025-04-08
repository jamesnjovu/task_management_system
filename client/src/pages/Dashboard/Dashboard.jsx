import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiCalendar, FiUsers, FiCheck, FiClock } from 'react-icons/fi';
import { getMyTeams } from '../../services/teamService';
import { getMyTasks } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { format, isAfter, isPast, addDays } from 'date-fns';
import Button from '../../components/common/Button';
import CreateTeamModal from '../../components/teams/CreateTeamModal';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { setAlert } = useAlert();
    const [teams, setTeams] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [teamsRes, tasksRes] = await Promise.all([
                    getMyTeams(),
                    getMyTasks(),
                ]);

                setTeams(teamsRes.data);
                setTasks(tasksRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setAlert('Failed to load dashboard data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setAlert]);

    const handleCreateTeam = async (newTeam) => {
        setShowCreateModal(false);
        // Refetch teams to include the new one
        try {
            const response = await getMyTeams();
            setTeams(response.data);
            setAlert('Team created successfully!', 'success');
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    // Tasks grouped by status
    const tasksByStatus = tasks.reduce(
        (acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        },
        { todo: [], in_progress: [], done: [] }
    );

    // Get overdue tasks (tasks with due date in the past)
    const overdueTasks = tasks.filter(
        (task) => task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'
    );

    // Get upcoming tasks (due in the next 7 days)
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const upcomingTasks = tasks.filter(
        (task) =>
            task.due_date &&
            !isPast(new Date(task.due_date)) &&
            isAfter(new Date(task.due_date), today) &&
            isAfter(nextWeek, new Date(task.due_date)) &&
            task.status !== 'done'
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {currentUser?.firstName || currentUser?.username}
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        icon={<FiPlus />}
                    >
                        Create Team
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                                <FiList className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Tasks
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {tasks.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
                                <FiClock className="h-6 w-6 text-warning-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        In Progress
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {tasksByStatus.in_progress?.length || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-success-100 rounded-md p-3">
                                <FiCheck className="h-6 w-6 text-success-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Completed
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {tasksByStatus.done?.length || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                                <FiUsers className="h-6 w-6 text-secondary-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Teams
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {teams.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Teams */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Your Teams</h2>
                            <Link
                                to="/teams"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                    <div className="px-4 py-3 divide-y divide-gray-200">
                        {teams.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">You don't have any teams yet</p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    icon={<FiPlus />}
                                    size="sm"
                                >
                                    Create Team
                                </Button>
                            </div>
                        ) : (
                            teams.slice(0, 5).map((team) => (
                                <div key={team.id} className="py-3">
                                    <Link
                                        to={`/tasks/${team.id}`}
                                        className="block hover:bg-gray-50 -m-3 p-3 rounded-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
                                                {team.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        {team.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                    {team.role}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Tasks */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
                    </div>

                    {/* Overdue Tasks */}
                    {overdueTasks.length > 0 && (
                        <div className="px-4 py-3">
                            <h3 className="text-sm font-medium text-danger-700 mb-2">Overdue</h3>
                            <div className="space-y-2">
                                {overdueTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-danger-50 border border-danger-100 rounded-md p-3"
                                    >
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-medium text-danger-800">{task.title}</h4>
                                            <span className="text-xs text-danger-700">
                                                Due {format(new Date(task.due_date), 'MMM d')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-danger-700 mt-1">
                                            {task.team?.name || 'No team'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Tasks */}
                    {upcomingTasks.length > 0 && (
                        <div className="px-4 py-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Upcoming</h3>
                            <div className="space-y-2">
                                {upcomingTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-50 border border-gray-200 rounded-md p-3"
                                    >
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                                            <span className="text-xs text-gray-700">
                                                Due {format(new Date(task.due_date), 'MMM d')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-700 mt-1">
                                            {task.team?.name || 'No team'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Tasks */}
                    <div className="px-4 py-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h3>
                        <div className="space-y-2">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 text-sm">No tasks yet</p>
                            ) : (
                                tasks
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                    .slice(0, 3)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-white border border-gray-200 rounded-md p-3"
                                        >
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'todo'
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : task.status === 'in_progress'
                                                                ? 'bg-warning-100 text-warning-800'
                                                                : 'bg-success-100 text-success-800'
                                                        }`}
                                                >
                                                    {task.status === 'todo'
                                                        ? 'To Do'
                                                        : task.status === 'in_progress'
                                                            ? 'In Progress'
                                                            : 'Done'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 mt-1">
                                                {task.team?.name || 'No team'}
                                            </p>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Team Modal */}
            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreateTeam={handleCreateTeam}
                />
            )}
        </div>
    );
};

export default Dashboard;
