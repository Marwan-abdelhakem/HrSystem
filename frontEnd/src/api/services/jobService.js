import api from "../axios";

export const getAllJobs = async () => {
    const { data } = await api.get("/api/job/getAlljobs");
    return data.data;
};
