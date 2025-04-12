import React from 'react';
import { useDrop } from 'react-dnd';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './TaskCard';

const TaskColumn = ({
    columnId,
    title,
    tasks,
    onAddTask,
    onTaskClick,
    moveTask
}) => {
    // Setup drop target for the whole column
    const [{ isOver }, drop] = useDrop({
        accept: 'TASK',
        drop: (item) => {
            // If the item comes from another column, add it to the end of this column
            if (item.sourceStatus !== columnId) {
                return { columnId };
            }
            return undefined; // Let individual cards handle reordering
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    // Setup drop target for the empty space at the bottom
    const [{ isOverBottom }, dropBottom] = useDrop({
        accept: 'TASK',
        drop: () => ({ 
            columnId,
            index: tasks.length // Drop at the end of the list
        }),
        collect: (monitor) => ({
            isOverBottom: !!monitor.isOver(),
        }),
    });

    return (
        <div className="task-column">
            <div className="task-header">
                <h3 className="text-gray-700">
                    {title} <span className="text-gray-500 ml-1">({tasks.length})</span>
                </h3>
                <button
                    className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onAddTask}
                    title={`Add task to ${title}`}
                >
                    <FiPlus className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Drop area for tasks - make the entire column droppable */}
            <div 
                ref={drop}
                className={`task-list ${isOver ? 'bg-gray-100' : ''}`}
            >
                {tasks.map((task, index) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onClick={() => onTaskClick(task)}
                        moveTask={moveTask}
                        columnId={columnId}
                    />
                ))}
                
                {/* Empty drop target at the bottom - will catch drops when the list is empty or when dropping at the end */}
                <div 
                    ref={dropBottom}
                    className={`flex-grow min-h-16 ${isOverBottom ? 'bg-blue-50' : ''}`}
                    style={{ minHeight: tasks.length === 0 ? '100px' : '30px' }}
                ></div>
            </div>
        </div>
    );
};

export default TaskColumn;