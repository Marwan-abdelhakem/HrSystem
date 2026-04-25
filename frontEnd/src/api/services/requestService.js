import api from "../axios";

export const createSalaryRequest = async (payload) => {
    const { data } = await api.post("/api/requests/salaryRequest", payload);
    return data.data;
};

export const updateSalaryRequest = async (employeeId, payload) => {
    const { data } = await api.patch(`/api/requests/updateSalaryRequest/${employeeId}`, payload);
    return data.data;
};

// Employee: fetch their own combined request history (leave + salary)
export const getMyRequests = async (employeeId) => {
    const { data } = await api.get(`/api/requests/myRequests/${employeeId}`);
    return data.data ?? [];
};
