import {SubHeaderProps} from "../../components/SubHeader.tsx";
import {ListType} from "../../components/List.tsx";
import {TrazaType} from "../../api/types/traza-types.ts";
import {ModelType} from "../../api/types/model-types.ts";
import {getAllTrazas, getTotalTrazas} from "../../api/trazas-api.ts";
import {PageListTemplate, PageProps} from "../templates/PageListTemplate.tsx";

const pageProps = {
    title: 'Historial de Trazas',
    isUser: false,
    newRecordPath: '/admin/traza',
    listType: {model: ModelType.TRAZA, elements: []} as ListType<TrazaType>,
    subheaderProps: [
        {title: 'ID', dbProperty: 'id', sort: 'asc'},
        {title: 'Activo', dbProperty: 'status', sort: 'asc'},
    ] as SubHeaderProps[],
    searchApi: getAllTrazas,
    getTotalApi: getTotalTrazas,
    getAllApi: getAllTrazas,
} as PageProps<TrazaType>;

export const History = () => {
    return (
        <PageListTemplate props={pageProps}/>
    );
}
