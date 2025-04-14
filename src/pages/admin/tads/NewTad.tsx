import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createTad} from "../../../api/tads-api.ts";
import {Tad, TadSchema, TadType} from "../../../api/types/tad-types.ts";

const newProps = {
    title: 'Nuevo TAD',
    createRecord: createTad,
    createZodSchema: TadSchema,
    objectInstance: new Tad({}),
} as NewProps<TadType>

export const NewTad = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
