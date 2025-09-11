import {z, ZodType} from "zod";

export interface ConsecutivoType {
	id: string;
	valor: number;
	createdAt: Date;
	updatedAt: Date;
}

export class Consecutivo implements Omit<ConsecutivoType, 'id' | 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<ConsecutivoType>) {
		Object.assign(this, partial);
	}

	valor!: number;
}

export type CreateConsecutivoType = Omit<ConsecutivoType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateConsecutivoType = Omit<ConsecutivoType, 'id' | 'createdAt' | 'updatedAt'>;

export const ConsecutivoSchema: ZodType = z.object({
	valor: z.string({
		required_error: "Valor es requerido",
	}).min(1, "Valor debe ser al menos 1"),
})

export const UpdateConsecutivoSchema: ZodType = z.object({
	valor: z.string({
		required_error: "Valor es requerido",
	}).min(1, "Valor debe ser al menos 1"),
})
