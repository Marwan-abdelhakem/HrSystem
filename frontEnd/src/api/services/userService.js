import api from "../axios";

export const getAllUsers = async () => {
    const { data } = await api.get("/api/users/getAllUsers");
    return data.data.users;
};

// Returns only Employee-role users — works for Admin and HR
export const getEmployees = async () => {
    const { data } = await api.get("/api/users/getEmployees");
    return data.data.employees;
};

// Returns Employee + HR users — for Admin task assignment (both roles can receive tasks)
export const getAssignableUsers = async () => {
    const { data } = await api.get("/api/users/getAssignableUsers");
    return data.data.users;
};

export const createUser = async (payload) => {
    const { data } = await api.post("/api/users/createUser", payload);
    return data.data;
};

// HR: create an employee — role is always "Employee" on the backend
export const createEmployee = async (payload) => {
    const { data } = await api.post("/api/users/createEmployee", payload);
    return data.data;
};

export const updateUser = async (id, payload) => {
    const { data } = await api.patch(`/api/users/updateUser/${id}`, payload);
    return data.data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/api/users/deleteUser/${id}`);
    return data;
};
