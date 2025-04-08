import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiLock, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';

const Profile = () => {
    const { currentUser, updateProfile, changePassword } = useAuth();
    const { setAlert } = useAlert();
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            username: currentUser?.username || '',
            email: currentUser?.email || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
        }
    });

    const passwordForm = useForm();

    const handleEditProfile = () => {
        setEditMode(true);
        setChangePasswordMode(false);
    };

    const handleChangePassword = () => {
        setChangePasswordMode(true);
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditMode(false);
        setChangePasswordMode(false);

        // Reset form values
        reset({
            username: currentUser?.username || '',
            email: currentUser?.email || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
        });

        passwordForm.reset();
    };

    const onSubmitProfile = async (data) => {
        setLoading(true);
        try {
            await updateProfile(data);
            setEditMode(false);
            setAlert('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            passwordForm.setError('confirmPassword', {
                type: 'manual',
                message: 'Passwords do not match',
            });
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setChangePasswordMode(false);
            passwordForm.reset();
            setAlert('Password changed successfully', 'success');
        } catch (error) {
            console.error('Error changing password:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <FiUser className="mr-2" /> User Information
                        </h2>
                        {!editMode && !changePasswordMode && (
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleEditProfile}
                                    variant="outline"
                                    size="sm"
                                    icon={<FiEdit2 />}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    onClick={handleChangePassword}
                                    variant="outline"
                                    size="sm"
                                    icon={<FiLock />}
                                >
                                    Change Password
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                    {editMode ? (
                        <form onSubmit={handleSubmit(onSubmitProfile)}>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <FormInput
                                    label="Username"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: {
                                            value: 3,
                                            message: 'Username must be at least 3 characters',
                                        },
                                        maxLength: {
                                            value: 30,
                                            message: 'Username must be less than 30 characters',
                                        },
                                    })}
                                    error={errors.username?.message}
                                    disabled={loading}
                                    required
                                />

                                <FormInput
                                    label="Email Address"
                                    type="email"
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

                                <FormInput
                                    label="First Name"
                                    {...register('firstName')}
                                    error={errors.firstName?.message}
                                    disabled={loading}
                                />

                                <FormInput
                                    label="Last Name"
                                    {...register('lastName')}
                                    error={errors.lastName?.message}
                                    disabled={loading}
                                />
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    ) : changePasswordMode ? (
                        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                            <div className="space-y-6 max-w-md">
                                <FormInput
                                    label="Current Password"
                                    type="password"
                                    {...passwordForm.register('currentPassword', {
                                        required: 'Current password is required',
                                    })}
                                    error={passwordForm.formState.errors.currentPassword?.message}
                                    disabled={loading}
                                    required
                                />

                                <FormInput
                                    label="New Password"
                                    type="password"
                                    {...passwordForm.register('newPassword', {
                                        required: 'New password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'New password must be at least 6 characters',
                                        },
                                    })}
                                    error={passwordForm.formState.errors.newPassword?.message}
                                    disabled={loading}
                                    required
                                />

                                <FormInput
                                    label="Confirm New Password"
                                    type="password"
                                    {...passwordForm.register('confirmPassword', {
                                        required: 'Please confirm your new password',
                                    })}
                                    error={passwordForm.formState.errors.confirmPassword?.message}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                                <p className="mt-1 text-sm text-gray-900">{currentUser?.username}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                                <p className="mt-1 text-sm text-gray-900">{currentUser?.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {currentUser?.firstName || '—'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {currentUser?.lastName || '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
