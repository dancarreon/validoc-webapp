import { CreateClientType, ClientType, UpdateClientType } from "./types/client-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createClient = async (client?: CreateClientType): Promise<ClientType> => {
	return await fetch(API_URL + '/clients', {
		method: "POST",
		body: JSON.stringify(client),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while creating client');
		return null;
	});
};

export const getAllClients = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<ClientType[]> => {
	const URI = `/clients`;
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
		console.log('An error occurred while getting all clients');
		return null;
	});
};

export const getTotalClients = async (search?: string | undefined): Promise<number> => {
	return await fetch(API_URL + `/totals/clients${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while getting total clients');
		return null;
	});
};

export const getClient = async (clientId: string): Promise<ClientType> => {
	return await fetch(API_URL + '/clients/' + clientId, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while getting client');
		return null;
	});
};

export const updateClient = async (clientId: string, client: UpdateClientType): Promise<ClientType> => {
	return await fetch(API_URL + '/clients/' + clientId, {
		method: "PATCH",
		body: JSON.stringify(client),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while updating client');
		return null;
	});
};
