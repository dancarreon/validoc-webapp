import {CreateClaveType, ClaveType, UpdateClaveType} from "./types/clave-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createClave = async (clave?: CreateClaveType): Promise<ClaveType> => {
    return await fetch(API_URL + '/claves', {
        method: "POST",
        body: JSON.stringify(clave),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating clave');
        return null;
    });
};

export const getAllClaves = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<ClaveType[]> => {
    const URI = `/claves`;
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
        console.log('An error occurred while getting all claves');
        return null;
    });
};

export const getTotalClaves = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/claves${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total claves');
        return null;
    });
};

export const getClave = async (claveId: string): Promise<ClaveType> => {
    return await fetch(API_URL + '/claves/' + claveId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting clave');
        return null;
    });
};

export const updateClave = async (claveId: string, clave: UpdateClaveType): Promise<ClaveType> => {
    return await fetch(API_URL + '/claves/' + claveId, {
        method: "PATCH",
        body: JSON.stringify(clave),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating clave');
        return null;
    });
};
