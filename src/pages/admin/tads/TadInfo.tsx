import {UpdateTadSchema, UpdateTadType} from "../../../api/types/tad-types.ts";
import {getTad, updateTad} from "../../../api/tads-api.ts";
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";

const infoProps = {
    getRecord: getTad,
    updateRecord: updateTad,
    updateZodSchema: UpdateTadSchema,
} as InfoProps<UpdateTadType>;

export const TadInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    );
};
