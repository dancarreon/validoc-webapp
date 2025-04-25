import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {UpdateTransportistaSchema, UpdateTransportistaType} from "../../../api/types/transportista-types.ts";
import {getTransportista, updateTransportista} from "../../../api/transportistas-api.ts";

const infoProps = {
    getRecord: getTransportista,
    updateRecord: updateTransportista,
    updateZodSchema: UpdateTransportistaSchema,
} as InfoProps<UpdateTransportistaType>;

export const TransportistaInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    )
}
