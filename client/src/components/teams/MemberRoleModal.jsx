import React, { useState } from 'react';
import { FiShield, FiUser, FiX } from 'react-icons/fi';
import { updateMemberRole } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../common/Button';

const MemberRoleModal = ({ teamId, member, onClose, onRoleUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(member.role);
    const { setAlert } = useAlert();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If role hasn't changed, just close the modal
        if (selectedRole === member.role) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            await updateMemberRole(teamId, member.id, selectedRole);
            onRoleUpdated();
        } catch (error) {
            console.error('Error updating member role:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to update member role. Please try again.';

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
                                Change Member Role
                            </h3>

                            <div className="mt-4">
                                <div className="flex items-center mb-6">
                                    {member.avatar_url ? (
                                        <img
                                            className="h-12 w-12 rounded-full mr-4"
                                            src={member.avatar_url}
                                            alt={member.username}
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white mr-4">
                                            {member.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-base font-medium text-gray-900">{member.username}</h4>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Role
                                            </label>

                                            <div className="space-y-3">
                                                <label className={`flex items-center p-3 border rounded-md ${selectedRole === 'admin'
                                                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                    } cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="admin"
                                                        checked={selectedRole === 'admin'}
                                                        onChange={() => setSelectedRole('admin')}
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

                                                <label className={`flex items-center p-3 border rounded-md ${selectedRole === 'member'
                                                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                    } cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="member"
                                                        checked={selectedRole === 'member'}
                                                        onChange={() => setSelectedRole('member')}
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
                                                Save Changes
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

export default MemberRoleModal;