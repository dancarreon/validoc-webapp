import {CreateStateType, StateType, UpdateStateType} from "./types/state-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createState = async (state?: CreateStateType): Promise<StateType> => {
    return await fetch(API_URL + '/estados', {
        method: "POST",
        body: JSON.stringify(state),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating state');
        return null;
    });
};

export const getAllStates = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<StateType[]> => {

    const URI = `/estados`;
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
        console.log('An error occurred while getting all states');
        return null;
    });
}

export const getTotalStates = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/estados${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
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

export const getState = async (stateId: string): Promise<StateType> => {
    return await fetch(API_URL + '/estados/' + stateId, {
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

export const updateState = async (stateId: string, state: UpdateStateType): Promise<StateType> => {
    return await fetch(API_URL + '/estados/' + stateId, {
        method: "PATCH",
        body: JSON.stringify(state),
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
