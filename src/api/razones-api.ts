import {CreateRazonType, RazonType, UpdateRazonType} from "./types/razon-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createRazon = async (razon?: CreateRazonType): Promise<RazonType> => {
    return await fetch(API_URL + '/razones', {
        method: "POST",
        body: JSON.stringify(razon),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating razon');
        return null;
    });
};

export const getAllRazones = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<RazonType[]> => {
    const URI = `/razones`;
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
        console.log('An error occurred while getting all razones');
        return null;
    });
};

export const getTotalRazones = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/razones${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total razones');
        return null;
    });
};

export const getRazon = async (razonId: string): Promise<RazonType> => {
    return await fetch(API_URL + '/razones/' + razonId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting razon');
        return null;
    });
};

export const updateRazon = async (razonId: string, razon: UpdateRazonType): Promise<RazonType> => {
    return await fetch(API_URL + '/razones/' + razonId, {
        method: "PATCH",
        body: JSON.stringify(razon),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating razon');
        return null;
    });
};
