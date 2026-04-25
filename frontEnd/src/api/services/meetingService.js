import api from "../axios";

export const createMeeting = async (payload) => {
    const { data } = await api.post("/api/meeting/creatMeeting", payload);
    return data.data;
};

export const getAllMeetings = async () => {
    const { data } = await api.get("/api/meeting/getAllMeeting");
    return data.data;
};

export const getMeetingsByCreator = async (creatorId) => {
    const { data } = await api.get(`/api/meeting/getAllMeetings/${creatorId}`);
    return data.data ?? [];
};

export const deleteMeeting = async (id, creatorId) => {
    const { data } = await api.delete(`/api/meeting/deleteMeeting/${id}`, { data: { creatorId } });
    return data;
};
