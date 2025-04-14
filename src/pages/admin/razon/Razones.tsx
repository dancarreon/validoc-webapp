import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ListType} from "../../../components/List.tsx";
import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {UserType} from "../../../api/types/user-types.ts";
import {ModelType} from "../../../api/types/model-types.ts";
import {getAllRazones, getTotalRazones} from "../../../api/razones-api.ts";

const listType: ListType<UserType> = {model: ModelType.RAZON, elements: []};

const pageProps = {
    title: 'Razones',
    isUser: false,
    newRecordPath: '/admin/nueva-razon',
    listType: listType,
    subheaderProps: [
        {title: 'Nombre', dbProperty: 'name', sort: 'asc'},
        {title: 'Status', dbProperty: 'status', sort: 'asc'}
    ] as SubHeaderProps[],
    searchApi: getAllRazones,
    getTotalApi: getTotalRazones,
    getAllApi: getAllRazones,
} as PageProps<UserType>;

export function Razones() {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
