import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { register: registerUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary-600 hover:text-primary-500"
                    >
                        sign in to your account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <FormInput
                                label="First Name"
                                {...register('firstName')}
                                disabled={loading}
                            />

                            <FormInput
                                label="Last Name"
                                {...register('lastName')}
                                disabled={loading}
                            />
                        </div>

                        <FormInput
                            label="Password"
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                            error={errors.password?.message}
                            disabled={loading}
                            required
                        />

                        <FormInput
                            label="Confirm Password"
                            type="password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value =>
                                    value === password || 'The passwords do not match',
                            })}
                            error={errors.confirmPassword?.message}
                            disabled={loading}
                            required
                        />

                        <div>
                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                Create account
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
