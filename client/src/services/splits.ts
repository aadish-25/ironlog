import { api } from "./api";
import { type Split } from "../types";

export const getSplits = async (): Promise<Split[]> => {
    const response = await api.get("/splits");
    return response.data.data as Split[];
};

export const getSplitById = async (id: string): Promise<Split> => {
    const response = await api.get(`/splits/${id}`);
    return response.data.data as Split;
};

export const createSplit = async (name: string): Promise<Split> => {
    const response = await api.post("/splits", { name });
    return response.data.data as Split;
};

export const activateSplit = async (id: string): Promise<Split> => {
    const response = await api.patch(`/splits/${id}/activate`);
    return response.data.data as Split;
};

export const deleteSplit = async (id: string): Promise<void> => {
    await api.delete(`/splits/${id}`);
};

export const updateSplit = async (id: string, name: string): Promise<Split> => {
    const response = await api.put(`/splits/${id}`, { name });
    return response.data.data as Split;
};
