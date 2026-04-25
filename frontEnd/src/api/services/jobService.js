import api from "../axios";

export const getAllJobs = async () => {
    const { data } = await api.get("/api/job/getAlljobs");
    return data.data;
};

export const createJob = async (payload) => {
    const { data } = await api.post("/api/job/createJob", payload);
    return data.data;
};

export const deleteJob = async (id, creatorId) => {
    const { data } = await api.delete(`/api/job/deleteJobs/${id}`, { data: { creatorId } });
    return data;
};
