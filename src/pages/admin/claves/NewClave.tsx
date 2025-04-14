import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createClave} from "../../../api/claves-api.ts";
import {Clave, ClaveType, CreateClaveSchema} from "../../../api/types/clave-types.ts";

const newProps = {
    title: 'Nueva Clave',
    createRecord: createClave,
    createZodSchema: CreateClaveSchema,
    objectInstance: new Clave({}),
} as NewProps<ClaveType>

export const NewClave = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
