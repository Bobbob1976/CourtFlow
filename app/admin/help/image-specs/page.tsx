import { Image as ImageIcon, CheckCircle, XCircle, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImageSpecsHelpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <Link
                    href="/admin/help"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Terug naar Help Center
                </Link>

                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold text-white">Afbeelding Specificaties</h1>
                    </div>
                    <p className="text-xl text-gray-400">
                        Technische richtlijnen voor het uploaden van afbeeldingen
                    </p>
                </div>

                {/* Quick Specs Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">📊 Snelle Referentie</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4">Booking Cards</h3>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• <strong>Aanbevolen:</strong> 1920x1080px (16:9)</li>
                                <li>• <strong>Minimum:</strong> 1280x720px</li>
                                <li>• <strong>Formaat:</strong> JPG, PNG, WebP</li>
                                <li>• <strong>Max grootte:</strong> 5MB</li>
                                <li>• <strong>Oriëntatie:</strong> Horizontaal</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4">Hero Banners</h3>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• <strong>Aanbevolen:</strong> 2560x1440px</li>
                                <li>• <strong>Minimum:</strong> 1920x1080px</li>
                                <li>• <strong>Formaat:</strong> JPG, PNG, WebP</li>
                                <li>• <strong>Max grootte:</strong> 5MB</li>
                                <li>• <strong>Oriëntatie:</strong> Horizontaal</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4">Court Images</h3>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• <strong>Aanbevolen:</strong> 1920x1080px</li>
                                <li>• <strong>Minimum:</strong> 1280x720px</li>
                                <li>• <strong>Formaat:</strong> JPG, PNG, WebP</li>
                                <li>• <strong>Max grootte:</strong> 5MB</li>
                                <li>• <strong>Oriëntatie:</strong> Horizontaal</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4">Gallery</h3>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• <strong>Aanbevolen:</strong> 1200x1200px (1:1)</li>
                                <li>• <strong>Minimum:</strong> 800x800px</li>
                                <li>• <strong>Formaat:</strong> JPG, PNG, WebP</li>
                                <li>• <strong>Max grootte:</strong> 5MB</li>
                                <li>• <strong>Oriëntatie:</strong> Vierkant</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Do's */}
                    <div className="bg-green-600/10 border border-green-500/30 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <h2 className="text-2xl font-bold text-white">✅ Wel Doen</h2>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Hoge resolutie:</strong> Minimaal 1280x720px voor scherpe weergave</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Goede belichting:</strong> Gebruik natuurlijk licht of professionele verlichting</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Actie shots:</strong> Spelers in beweging maken foto's dynamisch</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Professioneel:</strong> Gebruik een goede camera of smartphone</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Horizontaal:</strong> Voor booking cards en banners</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Comprimeer:</strong> Gebruik tools zoals TinyPNG voor kleinere bestanden</span>
                            </li>
                        </ul>
                    </div>

                    {/* Don'ts */}
                    <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircle className="w-8 h-8 text-red-400" />
                            <h2 className="text-2xl font-bold text-white">❌ Niet Doen</h2>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Lage kwaliteit:</strong> Pixelige of wazige foto's</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Donker:</strong> Onderbelichte foto's zijn moeilijk te zien</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Lege banen:</strong> Foto's zonder mensen zijn saai</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Watermerken:</strong> Geen logo's van anderen</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Verticaal:</strong> Voor booking cards werkt dit niet goed</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Te groot:</strong> Bestanden boven 5MB worden geweigerd</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">🔧 Technische Details</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-bold mb-3">Bestandsformaten</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-green-400 font-bold mb-2">✅ JPG/JPEG</h4>
                                    <p className="text-gray-400 text-sm">Beste voor foto's, goede compressie</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-green-400 font-bold mb-2">✅ PNG</h4>
                                    <p className="text-gray-400 text-sm">Beste voor graphics, transparantie mogelijk</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-green-400 font-bold mb-2">✅ WebP</h4>
                                    <p className="text-gray-400 text-sm">Moderne formaat, beste compressie</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Aspect Ratios</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li>• <strong>16:9</strong> - Booking cards, hero banners (bijv. 1920x1080)</li>
                                <li>• <strong>1:1</strong> - Gallery, profielfoto's (bijv. 1200x1200)</li>
                                <li>• <strong>4:3</strong> - Alternatief voor courts (bijv. 1600x1200)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Optimalisatie Tips</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Gebruik <strong>TinyPNG.com</strong> of <strong>Squoosh.app</strong> voor compressie</li>
                                <li>• Exporteer foto's met <strong>80-90% kwaliteit</strong> voor beste balans</li>
                                <li>• Gebruik <strong>sRGB kleurprofiel</strong> voor web</li>
                                <li>• Verwijder <strong>EXIF metadata</strong> voor kleinere bestanden</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-bold mb-2">💡 Pro Tip</h3>
                            <p className="text-gray-300">
                                Voor de beste resultaten, maak foto's tijdens een drukke sessie met veel actie.
                                Spelers die duiken, smashes maken, of vieren na een punt maken je booking cards veel aantrekkelijker!
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Vraag toestemming aan spelers voordat je foto's gebruikt voor marketing doeleinden.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
