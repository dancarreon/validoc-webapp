export const PdfSelector = ({onFileSelect}: { onFileSelect: (file: File) => void }) => (
    <input
        type="file"
        accept="application/pdf"
        onChange={e => {
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        }}
        placeholder="Selecciona un archivo PDF"
        className="file-input file-input-bordered file-input-neutral w-full max-w-xs mt-4 bg-gray-500"
    />
);
