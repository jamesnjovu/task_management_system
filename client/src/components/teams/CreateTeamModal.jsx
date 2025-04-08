import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { createTeam } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';

const CreateTeamModal = ({ onClose, onCreateTeam }) => {
    const [loading, setLoading] = useState(false);
    const { setAlert } = useAlert();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await createTeam(data);
            onCreateTeam(response.data);
        } catch (error) {
            console.error('Error creating team:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to create team. Please try again.';

            setAlert(errorMessage, 'error');
        } finally {
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
                                Create a New Team
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FormInput
                                        label="Team Name"
                                        {...register('name', {
                                            required: 'Team name is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Team name must be at least 3 characters',
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: 'Team name must be less than 50 characters',
                                            },
                                        })}
                                        error={errors.name?.message}
                                        disabled={loading}
                                        required
                                    />

                                    <div className="mb-4">
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            className="block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border-gray-300"
                                            placeholder="Describe the purpose of this team"
                                            {...register('description', {
                                                maxLength: {
                                                    value: 500,
                                                    message: 'Description must be less than 500 characters',
                                                },
                                            })}
                                            disabled={loading}
                                        ></textarea>
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-danger-600">
                                                {errors.description.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="w-full sm:ml-3 sm:w-auto"
                                            loading={loading}
                                            disabled={loading}
                                        >
                                            Create Team
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

export default CreateTeamModal;
