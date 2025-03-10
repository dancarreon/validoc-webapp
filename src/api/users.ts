import {CreateUserType, UpdateUserType, UserType} from "./types/user-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createUser = async (user?: CreateUserType): Promise<UserType> => {
    return await fetch(API_URL + '/users', {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating user');
        return null;
    });
};

export const getAllUsers = async (page: number): Promise<UserType[]> => {
    return await fetch(API_URL + `/users?size=${PAGE_SIZE}&page=${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting all users');
        return null;
    });
}

export const getTotalUsers = async (): Promise<number> => {
    return await fetch(API_URL + `/users/total`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total users');
        return null;
    });
}

export const getUser = async (userId: string): Promise<UserType> => {
    return await fetch(API_URL + '/users/' + userId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json()
        }
        console.log('An error occurred while getting user');
        return null;
    });
}

export const updateUser = async (userId: string, user: UpdateUserType): Promise<UserType> => {
    return await fetch(API_URL + '/users/' + userId, {
        method: "PATCH",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating user');
        return null;
    });
};
