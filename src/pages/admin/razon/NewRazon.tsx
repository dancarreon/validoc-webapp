import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {CreateRazonSchema, RazonType} from "../../../api/types/razon-types.ts";
import {createRazon} from "../../../api/razones-api.ts";

const newProps = {
    createRecord: createRazon,
    createZodSchema: CreateRazonSchema,
} as NewProps<RazonType>

export const NewRazon = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
