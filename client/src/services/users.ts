import { api } from "./api";
import { type User } from "../types";

export const getUser = async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data.data as User;
};

export const updateUser = async (data: Partial <User>): Promise <User> => {
    const response = await api.patch("/users/me", data);
    return response.data.data as User;
}