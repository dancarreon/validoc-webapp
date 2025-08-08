import React from 'react';
import {Document, Page} from 'react-pdf';
import {PDFDocument} from "pdf-lib";
import {PdfSelector} from "./PDFSelector.tsx";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export const PDFLoader: React.FC = () => {

	const [file, setPdfFile] = React.useState<File | null>(null);

	async function handleFileSelect(file: File) {
		const arrayBuffer = await file.arrayBuffer();
		const originalPdf = await PDFDocument.load(arrayBuffer);
		const newPdf = await PDFDocument.create();
		const [firstPage] = await newPdf.copyPages(originalPdf, [0]);
		newPdf.addPage(firstPage);
		const pdfBytes = await newPdf.save();
		const singlePageFile = new File([pdfBytes], file.name, {type: 'application/pdf'});
		setPdfFile(singlePageFile);
	}

	return (
		<>
			<PdfSelector onFileSelect={handleFileSelect}/>
			{file &&
				<Document file={file} loading={<div>Loading PDF...</div>}>
					<Page
						pageNumber={1}
						renderTextLayer={true}
						renderAnnotationLayer={false}
						renderMode={'canvas'}
						scale={3}
					/>
				</Document>
			}
		</>
	);
};
