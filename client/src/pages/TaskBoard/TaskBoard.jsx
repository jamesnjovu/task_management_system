import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { FiPlus } from 'react-icons/fi';
import { getTasks, updateTaskStatus, reorderTasks } from '../../services/taskService';
import { getTeamById } from '../../services/teamService';
import { useAlert } from '../../context/AlertContext';
import TaskColumn from '../../components/tasks/TaskColumn';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskModal from '../../components/tasks/TaskModal';
import Button from '../../components/common/Button';

const TaskBoard = () => {
    const { teamId } = useParams();
    const { setAlert } = useAlert();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState({
        todo: [],
        in_progress: [],
        done: [],
    });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalStatus, setCreateModalStatus] = useState('todo');
    const [selectedTask, setSelectedTask] = useState(null);

    // Fetch team and tasks on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [teamRes, tasksRes] = await Promise.all([
                    getTeamById(teamId),
                    getTasks(teamId),
                ]);

                setTeam(teamRes.data);

                // Organize tasks by status
                const tasksByStatus = {
                    todo: [],
                    in_progress: [],
                    done: [],
                };

                tasksRes.data.forEach((task) => {
                    if (tasksByStatus[task.status]) {
                        tasksByStatus[task.status].push(task);
                    }
                });

                setTasks(tasksByStatus);
            } catch (error) {
                console.error('Error fetching board data:', error);
                setAlert('Failed to load board data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamId, setAlert]);

    // Handle drag and drop
    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        // Dropped outside a droppable area
        if (!destination) return;

        // Dropped in the same place
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Get the task that was dragged
        const taskId = draggableId;

        // Make a copy of the current tasks state
        const newTasks = { ...tasks };

        // Remove the task from the source column
        const sourceColumn = newTasks[source.droppableId];
        const [removedTask] = sourceColumn.splice(source.index, 1);

        // Status changed
        if (source.droppableId !== destination.droppableId) {
            try {
                // Update task status in the backend
                await updateTaskStatus(taskId, destination.droppableId);

                // Add the task to the destination column
                const destinationColumn = newTasks[destination.droppableId];
                destinationColumn.splice(destination.index, 0, {
                    ...removedTask,
                    status: destination.droppableId,
                });

                setTasks(newTasks);
            } catch (error) {
                console.error('Error updating task status:', error);
                setAlert('Failed to update task status', 'error');

                // Revert the changes
                sourceColumn.splice(source.index, 0, removedTask);
                setTasks({ ...newTasks });
            }
        } else {
            // Just reordering within the same column
            sourceColumn.splice(destination.index, 0, removedTask);

            try {
                // Get all task IDs in the column in their new order
                const taskIds = sourceColumn.map((task) => task.id);

                // Update task order in the backend
                await reorderTasks(teamId, source.droppableId, taskIds);

                setTasks(newTasks);
            } catch (error) {
                console.error('Error reordering tasks:', error);
                setAlert('Failed to reorder tasks', 'error');

                // Revert the changes
                sourceColumn.splice(destination.index, 1);
                sourceColumn.splice(source.index, 0, removedTask);
                setTasks({ ...newTasks });
            }
        }
    };

    // Handle create task
    const handleCreateTask = (status) => {
        setCreateModalStatus(status);
        setShowCreateModal(true);
    };

    // Handle task created
    const handleTaskCreated = (newTask) => {
        // Add the new task to the appropriate column
        setTasks((prev) => ({
            ...prev,
            [newTask.status]: [...prev[newTask.status], newTask],
        }));
    };

    // Handle task click
    const handleTaskClick = (task) => {
        setSelectedTask(task.id);
    };

    // Handle task update
    const handleTaskUpdate = (updatedTask) => {
        // If the status changed, move the task to the appropriate column
        if (updatedTask.status !== selectedTask.status) {
            setTasks((prev) => {
                const newTasks = { ...prev };

                // Remove the task from its current column
                newTasks[selectedTask.status] = newTasks[selectedTask.status].filter(
                    (task) => task.id !== updatedTask.id
                );

                // Add the task to its new column
                newTasks[updatedTask.status] = [...newTasks[updatedTask.status], updatedTask];

                return newTasks;
            });
        } else {
            // Just update the task in place
            setTasks((prev) => {
                const newTasks = { ...prev };

                newTasks[updatedTask.status] = newTasks[updatedTask.status].map(
                    (task) => (task.id === updatedTask.id ? updatedTask : task)
                );

                return newTasks;
            });
        }
    };

    // Handle task delete
    const handleTaskDelete = (taskId) => {
        // Remove the task from its column
        setTasks((prev) => {
            const newTasks = { ...prev };

            // Find the column containing the task
            for (const status in newTasks) {
                newTasks[status] = newTasks[status].filter(
                    (task) => task.id !== taskId
                );
            }

            return newTasks;
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {team?.name} - Task Board
                </h1>
                <Button
                    onClick={() => handleCreateTask('todo')}
                    icon={<FiPlus />}
                >
                    Create Task
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <DragDropContext onDragEnd={handleDragEnd}>
                    {/* To Do Column */}
                    <div className="h-full">
                        <TaskColumn
                            columnId="todo"
                            title="To Do"
                            tasks={tasks.todo}
                            onAddTask={() => handleCreateTask('todo')}
                            onTaskClick={handleTaskClick}
                        />
                    </div>

                    {/* In Progress Column */}
                    <div className="h-full">
                        <TaskColumn
                            columnId="in_progress"
                            title="In Progress"
                            tasks={tasks.in_progress}
                            onAddTask={() => handleCreateTask('in_progress')}
                            onTaskClick={handleTaskClick}
                        />
                    </div>

                    {/* Done Column */}
                    <div className="h-full">
                        <TaskColumn
                            columnId="done"
                            title="Done"
                            tasks={tasks.done}
                            onAddTask={() => handleCreateTask('done')}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                </DragDropContext>
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <CreateTaskModal
                    teamId={teamId}
                    status={createModalStatus}
                    onClose={() => setShowCreateModal(false)}
                    onTaskCreated={handleTaskCreated}
                />
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskModal
                    taskId={selectedTask}
                    teamId={teamId}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                />
            )}
        </div>
    );
};

export default TaskBoard;
