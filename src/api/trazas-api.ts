import {CreateTrazaType, TrazaType, UpdateTrazaType} from "./types/traza-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createTraza = async (traza?: CreateTrazaType): Promise<TrazaType> => {
    return await fetch(API_URL + '/trazas', {
        method: "POST",
        body: JSON.stringify(traza),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating traza');
        return null;
    });
};

export const getAllTrazas = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<TrazaType[]> => {

    const URI = `/trazas`;
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
        console.log('An error occurred while getting all trazas');
        return null;
    });
}

export const getTotalTrazas = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/trazas${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total trazas');
        return null;
    });
}

export const getTraza = async (trazaId: string): Promise<TrazaType> => {
    return await fetch(API_URL + '/trazas/' + trazaId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json()
        }
        console.log('An error occurred while getting traza');
        return null;
    });
}

export const updateTraza = async (trazaId: string, traza: UpdateTrazaType): Promise<TrazaType> => {
    return await fetch(API_URL + '/trazas/' + trazaId, {
        method: "PATCH",
        body: JSON.stringify(traza),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating traza');
        return null;
    });
};
