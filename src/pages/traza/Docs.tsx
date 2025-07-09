import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useEffect, useState} from "react";
import {ModelType} from "../../api/types/model-types.ts";
import {useParams} from "react-router";
import {TemplateType} from "../../api/types/template-type.ts";
import {getTemplates} from "../../api/templates-api.ts";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";

const subheaderProps: SubHeaderProps[] = [
	{title: 'Nombre', dbProperty: 'username', sort: 'asc'},
	{title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Docs = () => {

	const [templateList, setTemplateList] = useState<TemplateType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	//const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

	const params = useParams();

	const handleClick = () => {
	}

	/*
	const handleSelection = (template: TemplateType) => {
		setSelectedTemplates(prev =>
			prev.includes(template.id)
				? prev.filter(id => id !== template.id)
				: [...prev, template.id]
		);
	}*/

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

		fetchTemplates();
	}, []);

	return (
		<div className='h-[100%] content-center mt-3'>
			<Container>
				<Steps step={5} trazaId={params.id}/>
				<Header title='Traza'/>
				<SubHeader props={subheaderProps}/>
				<List elements={{model: ModelType.TEMPLATE, elements: templateList}}/>
				{
					isLoading
						? (<Spinner styles='m-auto pb-10.5 grid'/>)
						: <>
							<Button type={'submit'}
									styles='mt-5 w-[55%] text-md'
									label='Generar Documentos'
									onClick={handleClick}/>
						</>
				}
			</Container>
		</div>
	)
}
