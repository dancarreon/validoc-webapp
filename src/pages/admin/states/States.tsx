import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {getAllStates, getTotalStates} from "../../../api/states-api.ts";
import {StateType} from "../../../api/types/state-types.ts";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {ListType} from "../../../components/List.tsx";

const pageProps = {
    title: 'Estados',
    isUser: false,
    newRecordPath: '/admin/nuevo-estado',
    listType: {model: ModelType.STATES, elements: []} as ListType<StateType>,
    subheaderProps: [
        {title: 'Nombre', dbProperty: 'name', sort: 'asc'},
        {title: 'Activo', dbProperty: 'status', sort: 'asc'},
    ] as SubHeaderProps[],
    searchApi: getAllStates,
    getTotalApi: getTotalStates,
    getAllApi: getAllStates,
} as PageProps<StateType>;

export const States = () => {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
