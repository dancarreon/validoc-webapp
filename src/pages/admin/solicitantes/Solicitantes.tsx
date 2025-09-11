import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {ListType} from "../../../components/List.tsx";
import {SolicitanteType} from "../../../api/types/solicitante-types.ts";
import {getAllSolicitantes, getTotalSolicitantes} from "../../../api/solicitante-api.ts";

const pageProps = {
	title: 'Solicitantes',
	isUser: false,
	newRecordPath: '/admin/nuevo-solicitante',
	listType: {model: ModelType.SOLICITANTE, elements: []} as ListType<SolicitanteType>,
	subheaderProps: [
		{title: 'Nombre', dbProperty: 'name', sort: 'asc'},
		{title: 'Activo', dbProperty: 'status', sort: 'asc'},
	] as SubHeaderProps[],
	searchApi: getAllSolicitantes,
	getTotalApi: getTotalSolicitantes,
	getAllApi: getAllSolicitantes,
} as PageProps<SolicitanteType>;

export const Solicitantes = () => {
	return (
		<PageListTemplate props={pageProps}/>
	)
}
