import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {CreateRazonSchema, Razon, RazonType} from "../../../api/types/razon-types.ts";
import {createRazon} from "../../../api/razones-api.ts";

const newProps = {
    title: 'Nueva Razon',
    createRecord: createRazon,
    createZodSchema: CreateRazonSchema,
    objectInstance: new Razon({}),
} as NewProps<RazonType>

export const NewRazon = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
