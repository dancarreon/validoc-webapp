import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {getAllClaves, getTotalClaves} from "../../../api/claves-api.ts";
import {ListType} from "../../../components/List.tsx";
import {ClaveType} from "../../../api/types/clave-types.ts";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";

const pageProps = {
    title: 'Claves',
    isUser: false,
    newRecordPath: '/admin/nueva-clave',
    listType: {model: ModelType.CLAVE, elements: []} as ListType<ClaveType>,
    subheaderProps: [
        {title: 'Clave', dbProperty: 'clave', sort: 'asc'},
        {title: 'Name', dbProperty: 'name', sort: 'asc'},
        {title: 'Activo', dbProperty: 'status', sort: 'asc'},
    ] as SubHeaderProps[],
    searchApi: getAllClaves,
    getTotalApi: getTotalClaves,
    getAllApi: getAllClaves,
} as PageProps<ClaveType>;

export const Claves = () => {
    return (
        <PageListTemplate props={pageProps}/>
    );
};
