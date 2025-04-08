import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './TaskCard';

const TaskColumn = ({
    columnId,
    title,
    tasks,
    onAddTask,
    onTaskClick
}) => {
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

            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`task-list ${snapshot.isDraggingOver ? 'bg-gray-100' : ''
                            }`}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default TaskColumn;
