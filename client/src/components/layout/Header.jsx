import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
    const { currentUser, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <button
                            type="button"
                            className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onClick={toggleSidebar}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <FiMenu className="h-6 w-6" />
                        </button>
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-primary-600">Task Manager</h1>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {/* Notifications */}
                        <button
                            type="button"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <span className="sr-only">View notifications</span>
                            <FiBell className="h-6 w-6" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    type="button"
                                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    id="user-menu-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {currentUser?.avatarUrl ? (
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={currentUser.avatarUrl}
                                            alt={currentUser.username}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                            {currentUser?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Dropdown menu */}
                            {showUserMenu && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                    role="menu"
                                >
                                    <div className="border-b border-gray-200 px-4 py-2 text-sm text-gray-700">
                                        <p className="font-medium">
                                            {currentUser?.firstName
                                                ? `${currentUser.firstName} ${currentUser.lastName || ''}`
                                                : currentUser?.username}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1 truncate">
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <FiUser className="mr-3 h-4 w-4 text-gray-500" />
                                        Your Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <FiSettings className="mr-3 h-4 w-4 text-gray-500" />
                                        Settings
                                    </Link>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <FiLogOut className="mr-3 h-4 w-4 text-gray-500" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
