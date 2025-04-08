import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiTrash2, FiUpload, FiPaperclip, FiSend } from 'react-icons/fi';
import {
    getTaskById,
    updateTask,
    deleteTask,
    getTaskComments,
    addComment,
    getTaskAttachments,
    uploadAttachment
} from '../../services/taskService';
import { getTeamMembers } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import Button from '../common/Button';
import { format } from 'date-fns';

const TaskModal = ({ taskId, teamId, onClose, onUpdate, onDelete }) => {
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const { setAlert } = useAlert();

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
    const commentForm = useForm();

    // Fetch task data on mount
    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                setLoading(true);
                const [taskRes, teamMembersRes] = await Promise.all([
                    getTaskById(taskId),
                    getTeamMembers(teamId)
                ]);

                setTask(taskRes.data);
                setTeamMembers(teamMembersRes.data);

                // Set form values
                reset({
                    title: taskRes.data.title,
                    description: taskRes.data.description || '',
                    status: taskRes.data.status,
                    priority: taskRes.data.priority,
                    assigned_to: taskRes.data.assigned_to || '',
                    due_date: taskRes.data.due_date ?
                        format(new Date(taskRes.data.due_date), 'yyyy-MM-dd') : ''
                });

                // Fetch comments and attachments
                fetchComments();
                fetchAttachments();
            } catch (error) {
                console.error('Error fetching task data:', error);
                setAlert('Failed to load task details', 'error');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchTaskData();
    }, [taskId, teamId, reset, setAlert, onClose]);

    // Fetch comments
    const fetchComments = async () => {
        try {
            const response = await getTaskComments(taskId);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    // Fetch attachments
    const fetchAttachments = async () => {
        try {
            const response = await getTaskAttachments(taskId);
            setAttachments(response.data);
        } catch (error) {
            console.error('Error fetching attachments:', error);
        }
    };

    // Update task
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const updatedTask = await updateTask(taskId, data);
            setTask(updatedTask.data);
            setAlert('Task updated successfully', 'success');
            onUpdate(updatedTask.data);
        } catch (error) {
            console.error('Error updating task:', error);
            setAlert('Failed to update task', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete task
    const handleDeleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            try {
                setLoading(true);
                await deleteTask(taskId);
                setAlert('Task deleted successfully', 'success');
                onDelete(taskId);
                onClose();
            } catch (error) {
                console.error('Error deleting task:', error);
                setAlert('Failed to delete task', 'error');
                setLoading(false);
            }
        }
    };

    // Add comment
    const handleAddComment = async (data) => {
        try {
            setCommenting(true);
            await addComment(taskId, data.content);
            commentForm.reset();
            await fetchComments();
            setAlert('Comment added', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            setAlert('Failed to add comment', 'error');
        } finally {
            setCommenting(false);
        }
    };

    // Upload attachment
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            await uploadAttachment(taskId, file);
            await fetchAttachments();
            setAlert('File uploaded successfully', 'success');
        } catch (error) {
            console.error('Error uploading file:', error);
            setAlert('Failed to upload file', 'error');
        } finally {
            setUploading(false);
            // Reset the file input
            event.target.value = '';
        }
    };

    if (loading && !task) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Task Details
                        </h2>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'details'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => setActiveTab('details')}
                            >
                                Details
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'comments'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => setActiveTab('comments')}
                            >
                                Comments ({comments.length})
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'attachments'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => setActiveTab('attachments')}
                            >
                                Attachments ({attachments.length})
                            </button>
                        </nav>
                    </div>

                    <div className="px-6 py-4">
                        {/* Details Tab */}
                        {activeTab === 'details' && (
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
                                            {...register('title', { required: 'Title is required' })}
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
                                            {...register('description')}
                                            disabled={loading}
                                        ></textarea>
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
                                            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                                                Assigned To
                                            </label>
                                            <select
                                                id="assigned_to"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                {...register('assigned_to')}
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
                                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                id="due_date"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                {...register('due_date')}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={handleDeleteTask}
                                        disabled={loading}
                                        icon={<FiTrash2 />}
                                    >
                                        Delete
                                    </Button>

                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onClose}
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
                                </div>
                            </form>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="space-y-4">
                                <div className="max-h-80 overflow-y-auto space-y-4">
                                    {comments.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No comments yet</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                                                <div className="flex items-start">
                                                    {comment.user.avatar_url ? (
                                                        <img
                                                            src={comment.user.avatar_url}
                                                            alt={comment.user.username}
                                                            className="h-8 w-8 rounded-full mr-3"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm mr-3">
                                                            {comment.user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {comment.user.username}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={commentForm.handleSubmit(handleAddComment)} className="mt-4">
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            placeholder="Add a comment..."
                                            {...commentForm.register('content', {
                                                required: 'Comment cannot be empty',
                                                maxLength: {
                                                    value: 500,
                                                    message: 'Comment must be less than 500 characters',
                                                },
                                            })}
                                            disabled={commenting}
                                        />
                                        <Button
                                            type="submit"
                                            className="ml-3"
                                            loading={commenting}
                                            disabled={commenting}
                                            icon={<FiSend />}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                    {commentForm.formState.errors.content && (
                                        <p className="mt-1 text-sm text-danger-600">
                                            {commentForm.formState.errors.content.message}
                                        </p>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Attachments Tab */}
                        {activeTab === 'attachments' && (
                            <div className="space-y-4">
                                <div className="max-h-80 overflow-y-auto space-y-2">
                                    {attachments.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No attachments yet</p>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                <div className="flex items-center">
                                                    <FiPaperclip className="h-5 w-5 text-gray-500 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{attachment.file_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Uploaded by {attachment.user?.username || 'Unknown'} on {format(new Date(attachment.uploaded_at), 'MMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`/api/attachments/${attachment.id}/download`}
                                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        onChange={handleFileUpload}
                                                        disabled={uploading}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Any file up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
