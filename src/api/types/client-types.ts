import {StatusType} from "./status-type.ts";
import {z, ZodType} from "zod";

export interface ClientType {
	id: string;
	noCliente: string;
	name: string;
	razonSocial: string;
	rfc: string;
	unbMx: string;
	direccion: string;
	direccionCorta: string;
	id2: string;
	status: StatusType;
	createdAt: Date;
	updatedAt: Date;
}

export class Client implements Omit<ClientType, 'id' | 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<ClientType>) {
		Object.assign(this, partial);
	}

	noCliente!: string;
	name!: string;
	razonSocial!: string;
	rfc!: string;
	unbMx!: string;
	direccion!: string;
	direccionCorta!: string;
	id2!: string;
	status!: StatusType;
}

export type CreateClientType = Omit<ClientType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateClientType = Omit<ClientType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateClientSchema: ZodType = z.object({
	noCliente: z.string({
		required_error: "No Cliente es requerido",
	}).min(6, "No Cliente debe tener al menos 6 caracteres"),
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(6, "Nombre debe tener al menos 6 caracteres"),
	razonSocial: z.string({
		required_error: "Razon Social es requerido",
	}).min(6, "Razon Social debe tener al menos 6 caracteres"),
	rfc: z.string({
		required_error: "RFC es requerido",
	}).min(12, "RFC debe tener al menos 12 caracteres"),
	unbMx: z.string({
		required_error: "UNB MX es requerido",
	}).min(6, "UNB MX debe tener al menos 6 caracteres"),
	direccion: z.string({
		required_error: "Direccion es requerida",
	}),
	direccionCorta: z.string({
		required_error: "Direccion Corta es requerida",
	}),
	id2: z.string().optional(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
});

export const UpdateClientSchema: ZodType = z.object({
	noCliente: z.string({
		required_error: "No Cliente es requerido",
	}).min(6, "No Cliente debe tener al menos 6 caracteres"),
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(6, "Nombre debe tener al menos 6 caracteres"),
	razonSocial: z.string({
		required_error: "Razon Social es requerido",
	}).min(6, "Razon Social debe tener al menos 6 caracteres"),
	rfc: z.string({
		required_error: "RFC es requerido",
	}).min(12, "RFC debe tener al menos 12 caracteres"),
	unbMx: z.string({
		required_error: "UNB MX es requerido",
	}).min(6, "UNB MX debe tener al menos 6 caracteres"),
	direccion: z.string({
		required_error: "Direccion es requerida",
	}),
	direccionCorta: z.string({
		required_error: "Direccion Corta es requerida",
	}),
	id2: z.string().optional(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
});


