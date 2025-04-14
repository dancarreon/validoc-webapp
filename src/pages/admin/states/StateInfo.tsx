import {UpdateStateSchema, UpdateStateType} from "../../../api/types/state-types.ts";
import {getState, updateState} from "../../../api/states-api.ts";
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";

const infoProps = {
    getRecord: getState,
    updateRecord: updateState,
    updateZodSchema: UpdateStateSchema,
} as InfoProps<UpdateStateType>;

export const StateInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    )
}
