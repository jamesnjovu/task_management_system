import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FiClock, FiPaperclip, FiMessageSquare } from 'react-icons/fi';
import { format } from 'date-fns';

const TaskCard = ({ task, index, onClick }) => {
    // Priority badge styling
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return (
                    <span className="priority-high">
                        High
                    </span>
                );
            case 'medium':
                return (
                    <span className="priority-medium">
                        Medium
                    </span>
                );
            case 'low':
                return (
                    <span className="priority-low">
                        Low
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    onClick={onClick}
                >
                    <h3 className="task-card-title">{task.title}</h3>

                    {task.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        {getPriorityBadge(task.priority)}

                        {task.due_date && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                <FiClock className="mr-1" />
                                {format(new Date(task.due_date), 'MMM d')}
                            </span>
                        )}
                    </div>

                    <div className="task-card-meta">
                        <div className="flex items-center">
                            {task._count?.comments > 0 && (
                                <span className="inline-flex items-center mr-2">
                                    <FiMessageSquare className="mr-1" />
                                    {task._count.comments}
                                </span>
                            )}

                            {task._count?.attachments > 0 && (
                                <span className="inline-flex items-center">
                                    <FiPaperclip className="mr-1" />
                                    {task._count.attachments}
                                </span>
                            )}
                        </div>

                        <div>
                            {task.assigned_to ? (
                                task.assignee ? (
                                    <div className="flex items-center">
                                        {task.assignee.avatar_url ? (
                                            <img
                                                src={task.assignee.avatar_url}
                                                alt={task.assignee.username}
                                                className="h-6 w-6 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs">
                                                {task.assignee.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="ml-1 text-xs">{task.assignee.username}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500">Assigned</span>
                                )
                            ) : (
                                <span className="text-xs text-gray-500">Unassigned</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
