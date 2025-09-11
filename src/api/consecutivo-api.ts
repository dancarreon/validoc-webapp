import {ConsecutivoType, CreateConsecutivoType, UpdateConsecutivoType} from "./types/consecutivo-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createConsecutivo = async (consecutivo?: CreateConsecutivoType): Promise<ConsecutivoType> => {
	return await fetch(API_URL + '/consecutivos', {
		method: "POST",
		body: JSON.stringify(consecutivo),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while creating consecutivo');
		return null;
	});
};

export const getAllConsecutivos = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<ConsecutivoType[]> => {

	const URI = `/consecutivos`;
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
		console.log('An error occurred while getting all consecutivos');
		return null;
	});
}

export const getTotalConsecutivos = async (search?: string | undefined): Promise<number> => {
	return await fetch(API_URL + `/totals/consecutivos${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while getting total consecutivos');
		return null;
	});
}

export const getConsecutivo = async (consecutivoId: string): Promise<ConsecutivoType> => {
	return await fetch(API_URL + '/consecutivos/' + consecutivoId, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json()
		}
		console.log('An error occurred while getting consecutivo');
		return null;
	});
}

export const updateConsecutivo = async (consecutivoId: string, consecutivo: UpdateConsecutivoType): Promise<ConsecutivoType> => {
	return await fetch(API_URL + '/consecutivos/' + consecutivoId, {
		method: "PATCH",
		body: JSON.stringify(consecutivo),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while updating consecutivo');
		return null;
	});
};
