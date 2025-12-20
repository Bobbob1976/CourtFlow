"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    clubId: string;
    onUploadComplete?: () => void;
}

export default function ImageUploadManager({ clubId, onUploadComplete }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageType, setImageType] = useState<string>("booking");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const supabase = createClient();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Selecteer een afbeelding');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Afbeelding is te groot (max 5MB)');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            // 1. Upload to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${clubId}/${Date.now()}.${fileExt}`;
            const filePath = `club-images/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('club-images')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('club-images')
                .getPublicUrl(filePath);

            // 3. Save metadata to database
            const { error: dbError } = await supabase
                .from('club_images')
                .insert({
                    club_id: clubId,
                    image_url: publicUrl,
                    image_type: imageType,
                    title: title || selectedFile.name,
                    description: description,
                    alt_text: title || selectedFile.name,
                    file_size: selectedFile.size,
                    mime_type: selectedFile.type,
                    storage_bucket: 'club-images',
                    storage_path: filePath,
                    is_active: true
                });

            if (dbError) throw dbError;

            // Success!
            alert('Afbeelding succesvol geüpload! ✅');

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            setTitle("");
            setDescription("");

            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Upload mislukt: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-400" />
                Upload Afbeelding
            </h3>

            {/* File Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selecteer Afbeelding
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-300">
                            {selectedFile ? selectedFile.name : 'Klik om afbeelding te selecteren'}
                        </span>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Max 5MB • JPG, PNG, WebP
                </p>
            </div>

            {/* Preview */}
            {previewUrl && (
                <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Preview
                    </label>
                    <div className="relative h-64 rounded-xl overflow-hidden bg-white/5">
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={clearSelection}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Image Type */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type Afbeelding
                </label>
                <select
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    disabled={uploading}
                >
                    <option value="booking">Booking Card</option>
                    <option value="court">Court</option>
                    <option value="club">Club</option>
                    <option value="hero">Hero Banner</option>
                    <option value="gallery">Gallery</option>
                </select>
            </div>

            {/* Title */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titel (optioneel)
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Bijv: Court 1 Actie Shot"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    disabled={uploading}
                />
            </div>

            {/* Description */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Beschrijving (optioneel)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Korte beschrijving van de afbeelding..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                    disabled={uploading}
                />
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Uploaden...
                    </>
                ) : (
                    <>
                        <Check className="w-5 h-5" />
                        Upload Afbeelding
                    </>
                )}
            </button>
        </div>
    );
}
