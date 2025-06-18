export const PdfSelector = ({onFileSelect}: { onFileSelect: (file: File) => void }) => (
    <input
        type="file"
        accept="application/pdf"
        onChange={e => {
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        }}
        className="file-input file-input-bordered"
    />
);
