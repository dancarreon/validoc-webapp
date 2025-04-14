import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createState} from "../../../api/states-api.ts";
import {State, StateSchema, StateType} from "../../../api/types/state-types.ts";

const newProps = {
    title: 'Nuevo Estado',
    createRecord: createState,
    createZodSchema: StateSchema,
    objectInstance: new State({}),
} as NewProps<StateType>

export const NewState = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
