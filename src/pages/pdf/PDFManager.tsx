import {useState} from 'react'
import {PdfSelector} from "../../components/PDFSelector.tsx";
import {PDFViewer} from "../../components/PDFViewer.tsx";
import {pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfManager = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    return (
        <div className='w-[50%] m-auto border-2 mt-4 rounded-lg border-gray-300 bg-gray-200 shadow-lg'>
            <div className="p-4 space-y-4">
                {!pdfFile ? (
                    <PdfSelector onFileSelect={setPdfFile}/>
                ) : (
                    <PDFViewer file={pdfFile}/>
                )}
            </div>
        </div>
    );
};
