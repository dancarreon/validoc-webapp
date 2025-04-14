import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {ListType} from "../../../components/List.tsx";
import {TadType} from "../../../api/types/tad-types.ts";
import {getAllTads, getTotalTads} from "../../../api/tads-api.ts";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";

const pageProps = {
    title: 'TADs',
    isUser: false,
    newRecordPath: '/admin/nuevo-tad',
    listType: {model: ModelType.TAD, elements: []} as ListType<TadType>,
    subheaderProps: [
        {title: 'Ciudad', dbProperty: 'ciudad', sort: 'asc'},
        {title: 'Estado', dbProperty: 'estadoId', sort: 'asc'},
    ] as SubHeaderProps[],
    searchApi: getAllTads,
    getTotalApi: getTotalTads,
    getAllApi: getAllTads,
} as PageProps<TadType>;

export const Tads = () => {
    return (
        <PageListTemplate props={pageProps}/>
    );
};
