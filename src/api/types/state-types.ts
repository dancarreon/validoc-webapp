import {z, ZodType} from "zod";
import {StatusType} from "./user-types.ts";

export interface StateType {
    id: string;
    name: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export class State implements Omit<StateType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<StateType>) {
        Object.assign(this, partial);
    }

    name!: string;
    status!: StatusType;
}

export type CreateStateType = Omit<StateType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateStateType = Omit<StateType, 'id' | 'createdAt' | 'updatedAt'>;

export const StateSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})

export const UpdateStateSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})
