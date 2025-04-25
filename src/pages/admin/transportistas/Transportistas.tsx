import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {ListType} from "../../../components/List.tsx";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {TransportistaType, UpdateTransportistaType} from "../../../api/types/transportista-types.ts";
import {getAllTransportistas, getTotalTransportistas} from "../../../api/transportistas-api.ts";

const pageProps = {
    title: 'Transportistas',
    isUser: false,
    newRecordPath: '/admin/nuevo-transportista',
    listType: {model: ModelType.TRANSPORTISTA, elements: []} as ListType<TransportistaType>,
    subheaderProps: [
        {title: 'Nombre', dbProperty: 'name', sort: 'asc'},
        {title: 'Apellido', dbProperty: 'lastName', sort: 'asc'},
        {title: 'Status', dbProperty: 'status', sort: 'asc'}
    ] as SubHeaderProps[],
    searchApi: getAllTransportistas,
    getTotalApi: getTotalTransportistas,
    getAllApi: getAllTransportistas,
} as PageProps<UpdateTransportistaType>;

export function Transportistas() {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
