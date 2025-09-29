import {z, ZodType} from "zod";
import {StatusType} from "./status-type.ts";

export interface ProductType {
	id: string;
	idProducto: string;
	clave: string;
	name: string;
	descripcion: string;
	iva: string;
	densidad: string;
	temperatura: string;
	createdAt: Date;
	updatedAt: Date;
	status: StatusType;
}

export class Product implements Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<ProductType>) {
		Object.assign(this, partial);
	}

	idProducto!: string;
	clave!: string;
	name!: string;
	descripcion!: string;
	iva!: string;
	densidad!: string;
	temperatura!: string;
	status!: StatusType;
}

export type CreateProductType = Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateProductType = Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateProductSchema: ZodType = z.object({
	idProducto: z.string({
		required_error: "ID Producto es requerido",
	}).min(1, "ID Producto debe tener al menos 1 caracter"),
	clave: z.string({
		required_error: "Clave es requerida",
	}).min(6, "Clave debe tener al menos 6 caracteres"),
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(4, "Nombre debe tener al menos 4 caracteres"),
	descripcion: z.string(),
	iva: z.string().optional(),
	densidad: z.string().optional(),
	temperatura: z.string().optional(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
})

export const UpdateProductSchema: ZodType = z.object({
	idProducto: z.string({
		required_error: "ID Producto es requerido",
	}).min(1, "ID Producto debe tener al menos 1 caracter"),
	clave: z.string({
		required_error: "Clave es requerida",
	}).min(6, "Clave debe tener al menos 6 caracteres"),
	name: z.string({
		required_error: "Nombre es requerido",
	}).min(4, "Nombre debe tener al menos 4 caracteres"),
	descripcion: z.string(),
	iva: z.string().optional(),
	densidad: z.string().optional(),
	temperatura: z.string().optional(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
})
