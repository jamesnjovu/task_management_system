import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FiClock, FiPaperclip, FiMessageSquare } from 'react-icons/fi';
import { format } from 'date-fns';

const TaskCard = ({ task, index, onClick, moveTask }) => {
    const ref = useRef(null);

    // Setup drag source
    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: () => ({ 
            id: task.id, 
            index,
            sourceStatus: task.status
        }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (dropResult && item.sourceStatus !== dropResult.columnId) {
                // Call moveTask function with task id and new status
                moveTask(item.id, dropResult.columnId);
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    // Setup drop ref (for reordering within the same list)
    const [, drop] = useDrop({
        accept: 'TASK',
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            
            const dragIndex = item.index;
            const hoverIndex = index;
            
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            
            // Only perform the move when we hover over a different item
            // and only when the items are in the same column
            if (moveTask && item.sourceStatus === task.status) {
                moveTask(item.id, task.status, dragIndex, hoverIndex);
                
                // Update the index for the dragged item
                item.index = hoverIndex;
            }
        },
    });

    // Apply refs to make the element both draggable and a drop target
    drag(drop(ref));

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
        <div
            ref={ref}
            className={`task-card ${isDragging ? 'opacity-50' : ''}`}
            onClick={onClick}
            style={{ opacity: isDragging ? 0.5 : 1 }}
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
    );
};

export default TaskCard;