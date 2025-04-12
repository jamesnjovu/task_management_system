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
    // Setup drop target for this column
    const [{ isOver }, drop] = useDrop({
        accept: 'TASK',
        drop: () => ({ 
            columnId: columnId 
        }),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
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

            {/* Drop area for tasks */}
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
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskColumn;