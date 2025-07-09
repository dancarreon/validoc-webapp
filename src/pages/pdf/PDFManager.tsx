import {useEffect, useState} from 'react'
import {PdfSelector} from "../../components/PDFSelector.tsx";
import {PDFViewer} from "../../components/PDFViewer.tsx";
import {pdfjs} from "react-pdf"
import {useParams} from "react-router";
import {getTemplateById, getTemplateFile} from "../../api/templates-api.ts";
import {TemplateType} from "../../api/types/template-type.ts";
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfManager = () => {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [template, setTemplate] = useState<TemplateType | null>(null);
	const params = useParams();

	useEffect(() => {
		async function fetchTemplate() {
			if (params.id) {
				const template = await getTemplateById(params.id);
				if (template) {
					if (template.pdfFile) {
						const file = await getTemplateFile(template.pdfFile);
						if (file) {
							setPdfFile(new File([file], template.pdfFile, {type: 'application/pdf'}));
							setTemplate(template);
						} else {
							console.error('Error fetching PDF file for template:', template.pdfFile);
						}
					} else {
						console.warn('Template does not have an associated PDF file:', template.id);
					}
				}
			}
		}

		setTimeout(function () {
			if (params.id) {
				fetchTemplate();
			}
		}, 500);
	}, [params.id]);

	// Extracts and sets only the first page as a new File
	async function handleFileSelect(file: File) {
		const arrayBuffer = await file.arrayBuffer();
		const originalPdf = await PDFDocument.load(arrayBuffer);
		const newPdf = await PDFDocument.create();
		const [firstPage] = await newPdf.copyPages(originalPdf, [0]);
		newPdf.addPage(firstPage);
		const pdfBytes = await newPdf.save();
		const singlePageFile = new File([pdfBytes], file.name, { type: 'application/pdf' });
		setPdfFile(singlePageFile);
	}

	return (
		<div className='w-[50%] m-auto border-2 mt-4 rounded-lg border-gray-300 bg-gray-200 shadow-lg'>
			<div className="p-4 space-y-4">
				{!pdfFile ? (
					<PdfSelector onFileSelect={handleFileSelect}/>
				) : (
					<PDFViewer file={pdfFile} template={template || undefined}/>
				)}
			</div>
		</div>
	);
};
