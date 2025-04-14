import {UpdateClaveSchema, UpdateClaveType} from "../../../api/types/clave-types.ts";
import {getClave, updateClave} from "../../../api/claves-api.ts";
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";

const infoProps = {
    getRecord: getClave,
    updateRecord: updateClave,
    updateZodSchema: UpdateClaveSchema,
} as InfoProps<UpdateClaveType>;

export const ClaveInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    );
};
