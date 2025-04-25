import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createTransportista} from "../../../api/transportistas-api.ts";
import {Transportista, TransportistaSchema, TransportistaType} from "../../../api/types/transportista-types.ts";

const newProps = {
    title: 'Nuevo Transportista',
    createRecord: createTransportista,
    createZodSchema: TransportistaSchema,
    objectInstance: new Transportista({}),
} as NewProps<TransportistaType>

export const NewTransportista = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
