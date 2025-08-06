import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {ListType} from "../../../components/List.tsx";
import {ClientType} from "../../../api/types/client-types.ts";
import {getAllClients, getTotalClients} from "../../../api/clients-api.ts";

const pageProps = {
	title: 'Clientes',
	isUser: false,
	newRecordPath: '/admin/nuevo-cliente',
	listType: {model: ModelType.CLIENT, elements: []} as ListType<ClientType>,
	subheaderProps: [
		{title: 'ID', dbProperty: 'noCliente', sort: 'asc'},
		{title: 'Nombre', dbProperty: 'name', sort: 'asc'},
		{title: 'Status', dbProperty: 'status', sort: 'asc'}
	] as SubHeaderProps[],
	searchApi: getAllClients,
	getTotalApi: getTotalClients,
	getAllApi: getAllClients,
} as PageProps<ClientType>;

export const Clientes = () => {
	return (
		<PageListTemplate props={pageProps}/>
	)
}
