import {CreateTemplateType, TemplateType, UpdateTemplateType} from './types/template-type.ts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/templates';
export const PAGE_SIZE = 10;

export async function getTemplates(): Promise<TemplateType[]> {
	const response = await axios.get(API_URL);
	return response.data;
}

export async function getTemplateById(id: string): Promise<TemplateType> {
	const response = await axios.get(`${API_URL}/${id}`);
	return response.data;
}

export async function createTemplate(data: CreateTemplateType): Promise<TemplateType> {
	const response = await axios.post(API_URL, data);
	return response.data;
}

export async function getTemplateFile(fileName: string): Promise<Blob> {
	const response = await axios.get(`${API_URL}/file/${fileName}`, {
		responseType: 'blob',
	});
	return new Blob([response.data], {type: 'application/pdf'});
}

export async function uploadPdfFile(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	const response = await axios.post(`${API_URL}/upload`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
}

export async function getTotalTemplates(search?: string): Promise<number> {
	const response = await axios.get(API_URL, {
		params: {
			search,
			size: PAGE_SIZE,
			page: 0,
		},
	});
	return response.data.length;
}

export async function updateTemplate(id: string, data: UpdateTemplateType): Promise<TemplateType> {
	const response = await axios.patch(`${API_URL}/${id}`, data);
	return response.data;
}

export async function deleteTemplate(id: string): Promise<void> {
	await axios.delete(`${API_URL}/${id}`);
}
