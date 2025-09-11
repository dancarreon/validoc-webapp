import {StatusType} from "./status-type.ts";
import {TemplateField} from "./template-field-type.ts";
import {z, ZodType} from "zod";
import {QrField} from "./qr-types.ts";

export interface TemplateType {
	id: string;
	name: string;
	status: StatusType;
	fields: TemplateField[];
	pdfFile: string;
	containerWidth?: number;
	createdAt: Date;
	updatedAt: Date;
	qrField: QrField[] | null;
}

export class Template implements Omit<TemplateType, 'id' | 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<TemplateType>) {
		Object.assign(this, partial);
	}

	status!: StatusType;
	name!: string;
	fields!: TemplateField[];
	pdfFile!: string;
	containerWidth?: number | undefined;
	qrField!: QrField[] | null;
}

export type CreateTemplateType = Omit<TemplateType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTemplateType = Omit<TemplateType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateTemplateSchema: ZodType = z.object({
	name: z.string(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
	fields: z.array(z.object({
		name: z.string(),
		x: z.number().int().min(0, "X debe ser un número entero positivo"),
		y: z.number().int().min(0, "Y debe ser un número entero positivo"),
		width: z.number().int().min(1, "Ancho debe ser un número entero positivo"),
		height: z.number().int().min(1, "Alto debe ser un número entero positivo"),
		fontSize: z.number().int().min(6, "Tamaño de fuente debe ser un número entero mayor o igual a 6").max(72, "Tamaño de fuente debe ser un número entero menor o igual a 72").optional(),
		fontFamily: z.enum(["Helvetica", "TimesRoman", "Courier"], {
			required_error: "Fuente es requerida",
		}).default("Helvetica"),
		align: z.enum(["left", "center", "right"], {
			required_error: "Alineación es requerida",
		}).default("left"),
	})).optional(),
})

export const UpdateTemplateSchema: ZodType = z.object({
	name: z.string(),
	status: z.enum(["ACTIVE", "INACTIVE"], {
		required_error: "Status es requerido",
	}).default("ACTIVE"),
	fields: z.array(z.object({
		name: z.string(),
		x: z.number().int().min(0, "X debe ser un número entero positivo"),
		y: z.number().int().min(0, "Y debe ser un número entero positivo"),
		width: z.number().int().min(1, "Ancho debe ser un número entero positivo"),
		height: z.number().int().min(1, "Alto debe ser un número entero positivo"),
		fontSize: z.number().int().min(6, "Tamaño de fuente debe ser un número entero mayor o igual a 6").max(72, "Tamaño de fuente debe ser un número entero menor o igual a 72").optional(),
		fontFamily: z.enum(["Helvetica", "TimesRoman", "Courier"], {
			required_error: "Fuente es requerida",
		}).default("Helvetica"),
		align: z.enum(["left", "center", "right"], {
			required_error: "Alineación es requerida",
		}).default("left"),
	})).optional(),
});
