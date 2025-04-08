import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { createTask } from '../../services/taskService';
import { getTeamMembers } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../common/Button';

const CreateTaskModal = ({ teamId, status = 'todo', onClose, onTaskCreated }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setAlert } = useAlert();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            status,
            priority: 'medium',
        }
    });

    // Fetch team members on mount
    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await getTeamMembers(teamId);
                setTeamMembers(response.data);
            } catch (error) {
                console.error('Error fetching team members:', error);
                setAlert('Failed to load team members', 'error');
            }
        };

        fetchTeamMembers();
    }, [teamId, setAlert]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const taskData = {
                ...data,
                teamId,
            };

            const response = await createTask(taskData);
            setAlert('Task created successfully', 'success');
            onTaskCreated(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to create task. Please try again.';

            setAlert(errorMessage, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Create a New Task
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Title <span className="text-danger-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.title ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                                                    }`}
                                                {...register('title', {
                                                    required: 'Title is required',
                                                    minLength: {
                                                        value: 3,
                                                        message: 'Title must be at least 3 characters'
                                                    },
                                                    maxLength: {
                                                        value: 100,
                                                        message: 'Title must be less than 100 characters'
                                                    }
                                                })}
                                                disabled={loading}
                                            />
                                            {errors.title && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Add a description for this task..."
                                                {...register('description', {
                                                    maxLength: {
                                                        value: 1000,
                                                        message: 'Description must be less than 1000 characters'
                                                    }
                                                })}
                                                disabled={loading}
                                            ></textarea>
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                    Status <span className="text-danger-500">*</span>
                                                </label>
                                                <select
                                                    id="status"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    {...register('status', { required: true })}
                                                    disabled={loading}
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                                                    Priority <span className="text-danger-500">*</span>
                                                </label>
                                                <select
                                                    id="priority"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    {...register('priority', { required: true })}
                                                    disabled={loading}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                                                    Assigned To
                                                </label>
                                                <select
                                                    id="assignedTo"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    {...register('assignedTo')}
                                                    disabled={loading}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {teamMembers.map((member) => (
                                                        <option key={member.id} value={member.id}>
                                                            {member.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="dueDate"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    {...register('dueDate')}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                        <Button
                                            type="submit"
                                            className="w-full sm:ml-3 sm:w-auto"
                                            loading={loading}
                                            disabled={loading}
                                        >
                                            Create Task
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-3 w-full sm:mt-0 sm:w-auto"
                                            onClick={onClose}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
