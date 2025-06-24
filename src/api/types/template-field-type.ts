import {TemplateType} from "./template-type.ts";

export interface TemplateFieldType {
    id: string;
    template: TemplateType;
    templateId: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontSize: number;
    align: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TemplateField implements Omit<TemplateFieldType, 'createdAt' | 'updatedAt' | 'template' | 'templateId'> {
    constructor(partial: Partial<TemplateFieldType>) {
        Object.assign(this, partial);
    }

    id!: string;
    name!: string;
    x!: number;
    y!: number;
    width!: number;
    height!: number;
    fontFamily!: string;
    fontSize!: number;
    align!: string;
}
