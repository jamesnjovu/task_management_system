import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

                if (error.teamRes && error.teamRes.status === 404) {
                    setAlert('Team not found. It may have been deleted.', 'error');
                } else {
                    setAlert('Failed to load team details', 'error');
                }
                if (error.tasksRes && error.tasksRes.status === 404) {
                    setAlert('Board data not found. It may have been deleted.', 'error');
                } else {
                    setAlert('Failed to load board data', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamId, setAlert]);

    // Handle task status change
    const moveTask = async (taskId, newStatus, sourceIndex, targetIndex) => {
        // Clone the current tasks state
        const newTasks = { ...tasks };

        // Find the task in all columns
        let taskToMove = null;
        let currentStatus = null;
        let oldIndex = -1;

        // Search for the task in all columns
        for (const status in newTasks) {
            const taskIndex = newTasks[status].findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                taskToMove = { ...newTasks[status][taskIndex] };
                currentStatus = status;
                oldIndex = taskIndex;

                // If we're just reordering within the same list
                if (sourceIndex !== undefined && targetIndex !== undefined && currentStatus === newStatus) {
                    // Remove from current position and insert at new position without triggering loading state
                    const column = [...newTasks[status]];
                    column.splice(oldIndex, 1);
                    column.splice(targetIndex, 0, taskToMove);

                    // Update the state immediately without setting loading=true
                    newTasks[status] = column;
                    setTasks({ ...newTasks });

                    // Update backend in the background without blocking UI
                    (async () => {
                        try {
                            const taskIds = column.map(task => task.id);
                            await reorderTasks(teamId, status, taskIds);
                        } catch (error) {
                            console.error('Error reordering tasks:', error);
                            setAlert('Failed to reorder tasks', 'error');
                        }
                    })();

                    return;
                }

                // Otherwise, remove the task from its current column
                newTasks[status].splice(taskIndex, 1);
                break;
            }
        }

        if (!taskToMove) {
            console.error('Task not found:', taskId);
            return;
        }

        // If status has changed
        if (currentStatus !== newStatus) {
            // Update UI immediately without waiting for API response
            taskToMove.status = newStatus;

            // Add the task to its new column at the specific index if provided, otherwise add to the end
            if (targetIndex !== undefined) {
                newTasks[newStatus].splice(targetIndex, 0, taskToMove);
            } else {
                newTasks[newStatus].push(taskToMove);
            }

            // Update state immediately
            setTasks({ ...newTasks });

            // Then update backend in the background
            (async () => {
                try {
                    await updateTaskStatus(taskId, newStatus);
                } catch (error) {
                    console.error('Error updating task status:', error);
                    setAlert('Failed to update task status', 'error');

                    // Revert the UI on error
                    setTasks(prevTasks => {
                        const revertTasks = { ...prevTasks };
                        // Find and remove the task from its new column
                        const taskToRevert = revertTasks[newStatus].find(t => t.id === taskId);
                        if (taskToRevert) {
                            revertTasks[newStatus] = revertTasks[newStatus].filter(t => t.id !== taskId);
                            // Restore original status
                            taskToRevert.status = currentStatus;
                            // Add back to original column at original position if possible
                            if (oldIndex >= 0 && oldIndex <= revertTasks[currentStatus].length) {
                                revertTasks[currentStatus].splice(oldIndex, 0, taskToRevert);
                            } else {
                                revertTasks[currentStatus].push(taskToRevert);
                            }
                        }
                        return revertTasks;
                    });
                }
            })();
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
        // Find the task's current status by searching all columns
        let oldStatus = null;
        for (const status in tasks) {
            const taskIndex = tasks[status].findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                oldStatus = status;
                break;
            }
        }

        if (!oldStatus) {
            console.error('Task not found in columns:', updatedTask.id);
            return;
        }

        // If the status changed, move the task to the appropriate column
        if (updatedTask.status !== oldStatus) {
            setTasks((prev) => {
                const newTasks = { ...prev };

                // Remove the task from its current column
                newTasks[oldStatus] = newTasks[oldStatus].filter(
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

            <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* To Do Column */}
                    <div className="h-full">
                        <TaskColumn
                            columnId="todo"
                            title="To Do"
                            tasks={tasks.todo}
                            onAddTask={() => handleCreateTask('todo')}
                            onTaskClick={handleTaskClick}
                            moveTask={moveTask}
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
                            moveTask={moveTask}
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
                            moveTask={moveTask}
                        />
                    </div>
                </div>
            </DndProvider>

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