import axios from 'axios';
import {CreateTadType, TadType, UpdateTadType} from './types/tad-types.ts';

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createTad = async (tad?: CreateTadType): Promise<TadType | null> => {
    try {
        const response = await axios.post(`${API_URL}/tads`, tad);
        return response.data;
    } catch (error) {
        console.log('An error occurred while creating tad');
        console.error(error);
        return null;
    }
};

export const getAllTads = async (
    page?: number,
    size?: number,
    search?: string | undefined,
    orderAndSort?: object[]
): Promise<TadType[] | null> => {
    const URI = `/tads`;
    const queryParams = {
        page: page ?? 0,
        size: size ?? PAGE_SIZE,
        search: search ?? '',
        orderAndSort: orderAndSort ? JSON.stringify(orderAndSort) : ''
    };
    try {
        const response = await axios.get(`${API_URL}${URI}`, {params: queryParams});
        return response.data;
    } catch (error) {
        console.log('An error occurred while getting all tads');
        console.error(error);
        return null;
    }
};

export const getTotalTads = async (search?: string | undefined): Promise<number> => {
    try {
        const response = await axios.get(`${API_URL}/totals/tads`, {
            params: search ? {search} : {}
        });
        return response.data;
    } catch (error) {
        console.log('An error occurred while getting total tads');
        console.error(error);
        return 0;
    }
};

export const getTad = async (tadId: string): Promise<TadType | null> => {
    try {
        const response = await axios.get(`${API_URL}/tads/${tadId}`);
        return response.data;
    } catch (error) {
        console.log('An error occurred while getting tad');
        console.error(error);
        return null;
    }
};

export const updateTad = async (tadId: string, tad: UpdateTadType): Promise<TadType | null> => {
    try {
        const response = await axios.patch(`${API_URL}/tads/${tadId}`, tad);
        return response.data;
    } catch (error) {
        console.log('An error occurred while updating tad');
        console.error(error);
        return null;
    }
};
