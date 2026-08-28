import { useMemo } from 'react';

export default function ImageUploadPreview({ file, currentPath, alt = 'Preview' }) {
    const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
    const src = previewUrl || (currentPath ? `/storage/${currentPath}` : null);

    if (!src) return null;

    return <img src={src} alt={alt} className="mt-2 h-32 w-48 rounded-lg border object-cover" />;
}
