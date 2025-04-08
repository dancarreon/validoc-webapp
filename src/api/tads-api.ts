import {CreateTadType, TadType, UpdateTadType} from "./types/tad-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createTad = async (tad?: CreateTadType): Promise<TadType> => {
    return await fetch(API_URL + '/tads', {
        method: "POST",
        body: JSON.stringify(tad),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating tad');
        return null;
    });
};

export const getAllTads = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<TadType[]> => {

    const URI = `/tads`;
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
        console.log('An error occurred while getting all tads');
        return null;
    });
}

export const getTotalTads = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/tads${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total tads');
        return null;
    });
}

export const getTad = async (tadId: string): Promise<TadType> => {
    return await fetch(API_URL + '/tads/' + tadId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json()
        }
        console.log('An error occurred while getting tad');
        return null;
    });
}

export const updateTad = async (tadId: string, tad: UpdateTadType): Promise<TadType> => {
    return await fetch(API_URL + '/tads/' + tadId, {
        method: "PATCH",
        body: JSON.stringify(tad),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating tad');
        return null;
    });
};
