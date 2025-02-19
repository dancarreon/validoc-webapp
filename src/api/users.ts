import {CreateUserType, UserType} from "./types/types.tsx";

const API_URL = "http://localhost:3000";

export const createUser = async (user?: CreateUserType): Promise<UserType> => {
    return await fetch(API_URL + '/users', {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => response.json());
};

export const getAllUsers = async (): Promise<UserType[]> => {
    return await fetch(API_URL + '/users', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => response.json());
}
