import api from "../axios";

// HR / Admin: fetch all tasks
export const getAllTasks = async () => {
    const { data } = await api.get("/api/task/getAllTasks");
    return data.data ?? [];
};

// Tasks assigned to this employee
export const getMyTasks = async (employeeId) => {
    const { data } = await api.get(`/api/task/getTasks/${employeeId}`);
    return data.data ?? [];
};

// Tasks created by this employee (peer-to-peer)
export const getCreatedTasks = async (employeeId) => {
    const { data } = await api.get(`/api/task/getCreatedTasks/${employeeId}`);
    return data.data ?? [];
};

// Employee marks a task done / adds notes
export const updateTaskStatus = async (taskId, payload) => {
    const { data } = await api.patch(`/api/task/updateTasksByEmp/${taskId}`, payload);
    return data.data;
};

// Employee creates a task (self or peer assignment)
export const createTask = async (payload) => {
    const { data } = await api.post("/api/task/createTasks", payload);
    return data.data;
};

// Employee deletes a task they created
export const deleteCreatedTask = async (id) => {
    const { data } = await api.delete(`/api/task/deleteCreatedTask/${id}`);
    return data;
};

// Admin deletes any task
export const deleteTask = async (id) => {
    const { data } = await api.delete(`/api/task/deleteTasks/${id}`);
    return data;
};
