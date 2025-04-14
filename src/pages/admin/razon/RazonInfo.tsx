import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {UpdateRazonSchema, UpdateRazonType} from "../../../api/types/razon-types.ts";
import {getRazon, updateRazon} from "../../../api/razones-api.ts";

const infoProps = {
    getRecord: getRazon,
    updateRecord: updateRazon,
    updateZodSchema: UpdateRazonSchema,
} as InfoProps<UpdateRazonType>

export const RazonInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    )
}
