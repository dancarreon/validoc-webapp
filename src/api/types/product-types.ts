import {StatusType} from "./user-types.ts";
import {z, ZodType} from "zod";

export interface ProductType {
    id: string;
    clave: string;
    descripcion: string;
    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export class Product implements Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<ProductType>) {
        Object.assign(this, partial);
    }

    clave!: string;
    descripcion!: string
    status!: StatusType;
}

export type CreateProductType = Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateProductType = Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateProductSchema: ZodType = z.object({
    clave: z.string({
        required_error: "Clave es requerida",
    }).min(6, "Clave debe tener al menos 6 caracteres"),
    descripcion: z.string()
})

export const UpdateProductSchema: ZodType = z.object({
    clave: z.string({
        required_error: "Clave es requerida",
    }).min(6, "Clave debe tener al menos 6 caracteres"),
    descripcion: z.string()
})
