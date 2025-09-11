import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {ListType} from "../../../components/List.tsx";
import {ConsecutivoType} from "../../../api/types/consecutivo-types.ts";
import {getAllConsecutivos, getTotalConsecutivos} from "../../../api/consecutivo-api.ts";

const pageProps = {
	title: 'Consecutivos',
	isUser: false,
	newRecordPath: '/admin/nuevo-consecutivo',
	listType: {model: ModelType.CONSECUTIVO, elements: []} as ListType<ConsecutivoType>,
	subheaderProps: [
		{title: 'Valor', dbProperty: 'valor', sort: 'asc'},
	] as SubHeaderProps[],
	searchApi: getAllConsecutivos,
	getTotalApi: getTotalConsecutivos,
	getAllApi: getAllConsecutivos,
} as PageProps<ConsecutivoType>;

export const Consecutivos = () => {
	return (
		<PageListTemplate props={pageProps}/>
	)
}
