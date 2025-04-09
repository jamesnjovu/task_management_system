import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiUserPlus } from 'react-icons/fi';
import { addTeamMember } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';

const AddTeamMemberModal = ({ teamId, onClose, onMemberAdded }) => {
    const [loading, setLoading] = useState(false);
    const { setAlert } = useAlert();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Convert email to userId by making an API request
            // In a real application, you would have an endpoint to search users by email
            const response = await addTeamMember(teamId, {
                email: data.email,
                role: data.role
            });
            
            setAlert('Team member added successfully!', 'success');
            onMemberAdded(response.data);
        } catch (error) {
            console.error('Error adding team member:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to add team member. Please check if the email is valid.';

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
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                            <FiUserPlus className="h-6 w-6 text-primary-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Add Team Member
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter team member's email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        error={errors.email?.message}
                                        disabled={loading}
                                        required
                                    />

                                    <div className="mt-4">
                                        <label
                                            htmlFor="role"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Role <span className="text-danger-500">*</span>
                                        </label>
                                        <select
                                            id="role"
                                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                                            {...register('role', {
                                                required: 'Role is required',
                                            })}
                                            disabled={loading}
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && (
                                            <p className="mt-1 text-sm text-danger-600">
                                                {errors.role.message}
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
                                            Add Member
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

export default AddTeamMemberModal;
