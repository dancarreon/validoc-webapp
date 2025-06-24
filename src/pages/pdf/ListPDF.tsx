import {ModelType} from "../../api/types/model-types.ts";
import {ListType} from "../../components/List.tsx";
import {SubHeaderProps} from "../../components/SubHeader.tsx";
import {PageListTemplate, PageProps} from "../templates/PageListTemplate.tsx";
import {TemplateType} from "../../api/types/template-type.ts";
import {getTemplates, getTotalTemplates} from "../../api/templates-api.ts";

const pageProps = {
	title: 'Lista de PDFs',
	isUser: false,
	newRecordPath: '/admin/nuevo-pdf',
	listType: {model: ModelType.TEMPLATE, elements: []} as ListType<TemplateType>,
	subheaderProps: [
		{title: 'Nombre', dbProperty: 'name', sort: 'asc'},
		{title: 'Activo', dbProperty: 'status', sort: 'asc'},
	] as SubHeaderProps[],
	searchApi: getTemplates,
	getTotalApi: getTotalTemplates,
	getAllApi: getTemplates,
} as PageProps<TemplateType>;

export const ListPdf = () => {
	return (
		<PageListTemplate props={pageProps}/>
	);
};
