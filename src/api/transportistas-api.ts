import {CreateTransportistaType, TransportistaType, UpdateTransportistaType} from "./types/transportista-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createTransportista = async (transportista?: CreateTransportistaType): Promise<TransportistaType> => {
    return await fetch(API_URL + '/transportistas', {
        method: "POST",
        body: JSON.stringify(transportista),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating transportista');
        return null;
    });
};

export const getAllTransportistas = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<TransportistaType[]> => {
    const URI = `/transportistas`;
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
        console.log('An error occurred while getting all transportistas');
        return null;
    });
};

export const getTotalTransportistas = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/transportistas${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total transportistas');
        return null;
    });
};

export const getTransportista = async (transportistaId: string): Promise<UpdateTransportistaType> => {
    return await fetch(API_URL + '/transportistas/' + transportistaId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting transportista');
        return null;
    });
};

export const getRandomTransportista = async (): Promise<TransportistaType> => {
    return await fetch(API_URL + '/random/transportista', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting random transportista');
        return null;
    });
}

export const updateTransportista = async (transportistaId: string, transportista: UpdateTransportistaType): Promise<TransportistaType> => {
    return await fetch(API_URL + '/transportistas/' + transportistaId, {
        method: "PATCH",
        body: JSON.stringify(transportista),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating transportista');
        return null;
    });
};
