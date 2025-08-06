import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useEffect, useState} from "react";
import {ModelType} from "../../api/types/model-types.ts";
import {useParams} from "react-router";
import {TemplateType} from "../../api/types/template-type.ts";
import {getTemplateFile, getTemplates} from "../../api/templates-api.ts";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";
import {createPdfWithFields} from "../../utils/pdfUtils.ts";
import {Field} from "../../components/PDFViewer.tsx";
import {TrazaType} from "../../api/types/traza-types.ts";
import {getTraza} from "../../api/trazas-api.ts";

const subheaderProps: SubHeaderProps[] = [
	{title: 'Nombre', dbProperty: 'username', sort: 'asc'},
	{title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Docs = () => {

	const [templateList, setTemplateList] = useState<TemplateType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
	const [traza, setTraza] = useState<TrazaType | undefined>(undefined);

	const params = useParams();

	const generateDocs = () => {
		if (selectedTemplates.length === 0) {
			console.log('Seleccione al menos una Plantilla.')
			return;
		}

		// Aquí puedes implementar la lógica para generar los documentos PDF
		selectedTemplates.forEach(async (templateId) => {
			const template = templateList.find(t => t.id === templateId);
			if (template) {
				try {

					const file = await getTemplateFile(template.pdfFile);

					if (file) {

						const fields: Field[] = template.fields.map(field => ({
							id: field.id,
							x: field.x,
							y: field.y,
							width: field.width,
							height: field.height,
							name: field.name as keyof TrazaType,
							fontFamily: field.fontFamily,
							fontSize: field.fontSize,
							align: field.align,
							backgroundColor: field.color,
						}));

						const pdfFile: File = new File([file], template.pdfFile, {type: 'application/pdf'});
						await createPdfWithFields(pdfFile, fields, template.containerWidth, traza);
					} else {
						console.error('Error fetching PDF file for template:', template.pdfFile);
					}
				} catch (error) {
					console.error(`Error generando documento para la plantilla ${template.name}:`, error);
				}
			}
		});
	}

	const handleSelection = (template: TemplateType) => {
		setSelectedTemplates(prev =>
			prev.includes(template.id)
				? prev.filter(id => id !== template.id)
				: [...prev, template.id]
		);
	}

	const handleChange = () => {
	}

	useEffect(() => {
		async function fetchTemplates() {
			setIsLoading(true);
			const templates = await getTemplates();
			if (templates) {
				setTemplateList(templates);
			} else {
				console.error('Error fetching templates');
			}
			setIsLoading(false);
		}

		async function fetchTraza() {
			if (params.id) {
				setIsLoading(true);
				const traza: TrazaType = await getTraza(params.id);
				if (traza) {
					setTraza(traza);
				} else {
					console.error('Error fetching traza:', params.id);
					setTraza(undefined);
				}
				setIsLoading(false);
			}
		}

		fetchTemplates();
		fetchTraza();
	}, [params.id]);

	return (
		<div className='h-[100%] content-center mt-3'>
			<Container>
				<Steps step={5} trazaId={params.id}/>
				<Header title='Traza'/>
				<SubHeader props={subheaderProps}/>
				<List elements={{model: ModelType.TEMPLATE, elements: templateList}}
					  onClick={(template: TemplateType) => handleSelection(template)}
					  selected={selectedTemplates}
					  onChange={handleChange}
				/>
				{
					isLoading
						? (<Spinner styles='m-auto pb-10.5 grid'/>)
						: (
							templateList.length > 0 &&
							<Button type={'submit'}
									styles='mt-5 w-[55%] text-md'
									label='Generar Documentos'
									onClick={generateDocs}
							/>
						)
				}
			</Container>
		</div>
	)
}
