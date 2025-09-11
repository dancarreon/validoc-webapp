import {CreateSolicitanteType, SolicitanteType, UpdateSolicitanteType} from "./types/solicitante-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createSolicitante = async (solicitante?: CreateSolicitanteType): Promise<SolicitanteType> => {
	return await fetch(API_URL + '/solicitantes', {
		method: "POST",
		body: JSON.stringify(solicitante),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while creating solicitante');
		return null;
	});
};

export const getAllSolicitantes = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<SolicitanteType[]> => {

	const URI = `/solicitantes`;
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
		console.log('An error occurred while getting all solicitantes');
		return null;
	});
}

export const getTotalSolicitantes = async (search?: string | undefined): Promise<number> => {
	return await fetch(API_URL + `/totals/solicitantes${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while getting total solicitantes');
		return null;
	});
}

export const getSolicitante = async (solicitanteId: string): Promise<UpdateSolicitanteType> => {
	return await fetch(API_URL + '/solicitantes/' + solicitanteId, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json()
		}
		console.log('An error occurred while getting solicitante');
		return null;
	});
}

export const updateSolicitante = async (solicitanteId: string, solicitante: UpdateSolicitanteType): Promise<SolicitanteType> => {
	return await fetch(API_URL + '/solicitantes/' + solicitanteId, {
		method: "PATCH",
		body: JSON.stringify(solicitante),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		console.log('An error occurred while updating solicitante');
		return null;
	});
};
