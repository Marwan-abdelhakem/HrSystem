import api from "../axios";

export const getAllLeaveRequests = async () => {
    const { data } = await api.get("/api/leave/getAllRequest");
    return data.data;
};

export const getLeaveRequestsByEmployee = async (employeeId) => {
    const { data } = await api.get(`/api/leave/getRequestById/${employeeId}`);
    return data.data;
};

export const createLeaveRequest = async (payload) => {
    const { data } = await api.post("/api/leave/LeaveRequest", payload);
    return data.data;
};

export const updateLeaveRequest = async (employeeId, payload) => {
    const { data } = await api.patch(`/api/leave/updateRequest/${employeeId}`, payload);
    return data.data;
};
