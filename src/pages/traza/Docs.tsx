import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useEffect, useState, useRef} from "react";
import {ModelType} from "../../api/types/model-types.ts";
import {useParams} from "react-router";
import {TemplateType} from "../../api/types/template-type.ts";
import {getTemplateFile, getTemplates} from "../../api/templates-api.ts";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";
import {Field} from "../../api/types/field-types";
import {TrazaType} from "../../api/types/traza-types.ts";
import {getTraza} from "../../api/trazas-api.ts";
import {ReactPDFGenerator} from "../../components/ReactPDFGenerator.tsx";
import {ClientType} from "../../api/types/client-types.ts";
import {getClient} from "../../api/clients-api.ts";

const subheaderProps: SubHeaderProps[] = [
	{title: 'Nombre', dbProperty: 'username', sort: 'asc'},
	{title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Docs = () => {

	const [templateList, setTemplateList] = useState<TemplateType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
	const [traza, setTraza] = useState<TrazaType | undefined>(undefined);
	const [client, setClient] = useState<ClientType | undefined>(undefined);
	
	// Add container width and scale for coordinate consistency (same as PDFViewer)
	const [containerWidth] = useState<number | null>(800); // Default container width
	const scale = 1.0; // Default scale factor
	
	// Ref for ReactPDFGenerator
	const reactPDFGeneratorRef = useRef<any>(null);

	const params = useParams();

	const generateDocs = async () => {
		if (selectedTemplates.length === 0) {
			console.log('Seleccione al menos una Plantilla.')
			return;
		}

		// Generate PDFs for each selected template using ReactPDFGenerator
		for (const templateId of selectedTemplates) {
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
							type: (field.type as 'data' | 'qr') || 'data',
						}));

						const pdfFile: File = new File([file], template.pdfFile, {type: 'application/pdf'});
						
						// Use the template's containerWidth for coordinate consistency
						const templateContainerWidth = template.containerWidth || 800;
						
						// Use ReactPDFGenerator for perfect consistency with PDFViewer
						if (reactPDFGeneratorRef.current) {
							// Set the file and fields for this template
							reactPDFGeneratorRef.current.setFile(pdfFile);
							reactPDFGeneratorRef.current.setFields(fields);
							reactPDFGeneratorRef.current.setTraza(traza);
							reactPDFGeneratorRef.current.setClient(client);
							
							// Generate the PDF with the correct container width
							await reactPDFGeneratorRef.current.generatePDF(pdfFile, fields, traza, client, templateContainerWidth);
						}
					} else {
						console.error('Error fetching PDF file for template:', template.pdfFile);
					}
				} catch (error) {
					console.error(`Error generando documento para la plantilla ${template.name}:`, error);
				}
			}
		}
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
					
					// Also fetch client data if traza has clienteId
					if (traza.clienteId) {
						try {
							const client: ClientType = await getClient(traza.clienteId);
							if (client) {
								setClient(client);
							}
						} catch (error) {
							console.error('Error fetching client:', error);
						}
					}
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
				
				{/* Hidden ReactPDFGenerator for PDF generation */}
				<div style={{ display: 'none' }}>
					<ReactPDFGenerator
						ref={reactPDFGeneratorRef}
						file={null}
						fields={[]}
						traza={traza || {
							id: 'test-id',
							folio: 'TEST-001',
							placasTractor: 'ABC-123',
							placasAutotanque1: 'XYZ-789',
							sello1Autotanque1: 'SELLO-456',
							sello2Autotanque1: 'SELLO-789',
							nombreTransportista: 'Transportista Ejemplo S.A.',
							nombreOperador: 'Juan Pérez',
							destino: 'Ciudad de México',
							destinoCorto: 'CDMX',
							litrosTotales: 50000,
							precioLitro: 25.50,
							folioPemex1: 'PEMEX-001',
							folioTrasvase: 'TRASVASE-001',
							numeroTractor: 'TRACTOR-001',
							autotanque1: 'AUTOTANQUE-001',
							cfi: 'CFI-001',
							numeroLicencia: 'LIC-001',
							marcaUnidad1: 'Marca Ejemplo',
							folioCartaPorte: 'CARTA-PORTE-001',
						} as TrazaType}
						client={client || {
							id: 'client-test-id',
							noCliente: 'CLI-001',
							name: 'Cliente Ejemplo S.A.',
							razonSocial: 'Cliente Ejemplo Sociedad Anónima',
							rfc: 'CEX123456789',
							unbMx: 'UNB-MX-001',
							direccion: 'Av. Principal 123, Col. Centro, Ciudad de México',
							direccionCorta: 'Av. Principal 123, CDMX',
							id2: 'CLI-001-ALT',
							status: 'ACTIVE' as any,
							createdAt: new Date(),
							updatedAt: new Date(),
						} as ClientType}
						containerWidth={containerWidth}
						scale={scale}
					/>
				</div>
			</Container>
		</div>
	)
}
