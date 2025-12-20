"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
    clubId: string;
    refreshTrigger?: number;
}

interface ClubImage {
    id: string;
    image_url: string;
    image_type: string;
    title: string;
    description: string;
    is_active: boolean;
    created_at: string;
    file_size: number;
    storage_path: string;
}

export default function ImageGallery({ clubId, refreshTrigger }: ImageGalleryProps) {
    const [images, setImages] = useState<ClubImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    const supabase = createClient();

    const loadImages = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('club_images')
                .select('*')
                .eq('club_id', clubId)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('image_type', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, [clubId, filter, refreshTrigger]);

    const toggleActive = async (imageId: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('club_images')
                .update({ is_active: !currentState })
                .eq('id', imageId);

            if (error) throw error;

            loadImages(); // Refresh
        } catch (error: any) {
            alert(`Fout: ${error.message}`);
        }
    };

    const deleteImage = async (imageId: string, storagePath: string) => {
        if (!confirm('Weet je zeker dat je deze afbeelding wilt verwijderen?')) return;

        try {
            // Delete from storage
            if (storagePath) {
                await supabase.storage
                    .from('club-images')
                    .remove([storagePath]);
            }

            // Delete from database
            const { error } = await supabase
                .from('club_images')
                .delete()
                .eq('id', imageId);

            if (error) throw error;

            loadImages(); // Refresh
            alert('Afbeelding verwijderd! ✅');
        } catch (error: any) {
            alert(`Fout bij verwijderen: ${error.message}`);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                    Afbeeldingen ({images.length})
                </h3>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="all">Alle Types</option>
                    <option value="booking">Booking</option>
                    <option value="court">Court</option>
                    <option value="club">Club</option>
                    <option value="hero">Hero</option>
                    <option value="gallery">Gallery</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Laden...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Geen afbeeldingen gevonden</p>
                    <p className="text-gray-500 text-sm mt-2">Upload je eerste afbeelding hierboven</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${image.is_active
                                    ? 'border-green-500/30 bg-green-500/5'
                                    : 'border-white/10 bg-white/5 opacity-60'
                                }`}
                        >
                            {/* Image */}
                            <div className="relative h-48">
                                <Image
                                    src={image.image_url}
                                    alt={image.title || 'Club image'}
                                    fill
                                    className="object-cover"
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => toggleActive(image.id, image.is_active)}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                        title={image.is_active ? 'Deactiveren' : 'Activeren'}
                                    >
                                        {image.is_active ? (
                                            <EyeOff className="w-5 h-5 text-white" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteImage(image.id, image.storage_path)}
                                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                                        title="Verwijderen"
                                    >
                                        <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${image.is_active
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-600 text-gray-300'
                                        }`}>
                                        {image.is_active ? 'Actief' : 'Inactief'}
                                    </span>
                                </div>

                                {/* Type Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-1 bg-blue-600/90 text-white rounded-md text-xs font-bold uppercase">
                                        {image.image_type}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="text-white font-bold mb-1 truncate">
                                    {image.title || 'Untitled'}
                                </h4>
                                {image.description && (
                                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                                        {image.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{formatFileSize(image.file_size)}</span>
                                    <span>{new Date(image.created_at).toLocaleDateString('nl-NL')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
