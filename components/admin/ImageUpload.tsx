'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ImageUploadProps {
    bucket: string;
    onUploadComplete: (url: string) => void;
    label?: string;
    className?: string;
}

export default function ImageUpload({ bucket, onUploadComplete, label = "Upload Afbeelding", className = "" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const supabase = createClient();

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            onUploadComplete(data.publicUrl);

        } catch (error) {
            alert('Error uploading image!');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#C4FF0D] transition-all group">

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#C4FF0D] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-400">Uploaden...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#C4FF0D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mb-2 text-sm text-gray-400 group-hover:text-white"><span className="font-bold">{label}</span></p>
                        <p className="text-xs text-gray-500">PNG, JPG of GIF (Max 5MB)</p>
                    </div>
                )}

                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
