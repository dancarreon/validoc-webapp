import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {ListType} from "../../../components/List.tsx";
import {getAllUsers, getTotalUsers} from "../../../api/users-api.ts";
import {UpdateUserType, UserType} from "../../../api/types/user-types.ts";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";

const pageProps = {
    title: 'Usuarios',
    isUser: false,
    newRecordPath: '/admin/nuevo-usuario',
    listType: {model: ModelType.USER, elements: []} as ListType<UserType>,
    subheaderProps: [
        {title: 'Usuario', dbProperty: 'username', sort: 'asc'},
        {title: 'Status', dbProperty: 'status', sort: 'asc'}
    ] as SubHeaderProps[],
    searchApi: getAllUsers,
    getTotalApi: getTotalUsers,
    getAllApi: getAllUsers,
} as PageProps<UpdateUserType>;

export function Users() {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
