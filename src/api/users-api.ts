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

export const getAllUsers = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<UserType[]> => {

    const URI = `/users`;
    const queryParams: string = `?page=${page ? page : 0}&size=${size ? size : PAGE_SIZE}&search=${search ? search : ''}&orderAndSort=${orderAndSort ? encodeURIComponent(JSON.stringify(orderAndSort)) : ''}`;

    return await fetch(API_URL + URI + queryParams, {
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

export const getTotalUsers = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/users${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
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

export const getUser = async (userId: string): Promise<UpdateUserType> => {
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
