import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUserPlus, FiX, FiMail, FiShield, FiUser } from 'react-icons/fi';
import { addTeamMember, searchUsers } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';

const AddTeamMemberModal = ({ teamId, onClose, onMemberAdded }) => {
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const { setAlert } = useAlert();
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            email: '',
            role: 'member'
        }
    });

    const email = watch('email');

    const searchForUser = async () => {
        if (!email || email.length < 3) return;
        
        setSearching(true);
        try {
            const response = await searchUsers(email);
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setValue('email', value);
        
        // Debounce search
        if (value.length >= 3) {
            const debounce = setTimeout(() => {
                searchForUser();
            }, 500);
            
            return () => clearTimeout(debounce);
        }
    };

    const selectUser = (user) => {
        setValue('email', user.email);
        setSearchResults([]);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await addTeamMember(teamId, {
                email: data.email,
                role: data.role
            });
            
            onMemberAdded();
        } catch (error) {
            console.error('Error adding team member:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to add team member. Please check if the email is valid.';

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
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                            <FiUserPlus className="h-6 w-6 text-primary-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Add Team Member
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="relative">
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
                                            onChange={handleEmailChange}
                                            error={errors.email?.message}
                                            disabled={loading}
                                            required
                                        />
                                        
                                        {/* Search results dropdown */}
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                                <ul className="py-1">
                                                    {searchResults.map((user) => (
                                                        <li 
                                                            key={user.id}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                            onClick={() => selectUser(user)}
                                                        >
                                                            {user.avatar_url ? (
                                                                <img 
                                                                    src={user.avatar_url} 
                                                                    alt={user.username} 
                                                                    className="h-6 w-6 rounded-full mr-2"
                                                                />
                                                            ) : (
                                                                <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs mr-2">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{user.username}</p>
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {searching && (
                                            <div className="absolute right-3 top-10 text-gray-400">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role <span className="text-danger-500">*</span>
                                        </label>
                                        
                                        <div className="space-y-3">
                                            <label className={`flex items-center p-3 border rounded-md ${
                                                watch('role') === 'member' 
                                                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            } cursor-pointer`}>
                                                <input
                                                    type="radio"
                                                    {...register('role')}
                                                    value="member"
                                                    checked={watch('role') === 'member'}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <div className="ml-3 flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <FiUser className="h-5 w-5 text-gray-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="text-sm font-medium text-gray-900">Member</h4>
                                                        <p className="text-xs text-gray-500">Can view and work on team tasks</p>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <label className={`flex items-center p-3 border rounded-md ${
                                                watch('role') === 'admin' 
                                                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            } cursor-pointer`}>
                                                <input
                                                    type="radio"
                                                    {...register('role')}
                                                    value="admin"
                                                    checked={watch('role') === 'admin'}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <div className="ml-3 flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <FiShield className="h-5 w-5 text-primary-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="text-sm font-medium text-gray-900">Admin</h4>
                                                        <p className="text-xs text-gray-500">Can manage team members and team settings</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
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