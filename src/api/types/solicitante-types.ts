import {z, ZodType} from "zod";
import {StatusType} from "./status-type.ts";

export interface SolicitanteType {
	id: string;
	name: string;
	status: StatusType;
	createdAt: Date;
	updatedAt: Date;
}

export class Solicitante implements Omit<SolicitanteType, 'id' | 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<SolicitanteType>) {
		Object.assign(this, partial);
	}

	name!: string;
	status!: StatusType;
}

export type CreateSolicitanteType = Omit<SolicitanteType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateSolicitanteType = Omit<SolicitanteType, 'id' | 'password' | 'createdAt' | 'updatedAt'>;

export const SolicitanteSchema: ZodType = z.object({
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(4, "Nombre debe tener al menos 4 caracteres"),
	status: z.string().optional(),
})

export const UpdateSolicitanteSchema: ZodType = z.object({
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(4, "Nombre debe tener al menos 4 caracteres"),
	status: z.string().optional(),
})
