"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface OnboardingStep {
    title: string;
    description: string;
    icon: string;
}

const STEPS: OnboardingStep[] = [
    { title: "Club Informatie", description: "Basis gegevens van je club", icon: "🏢" },
    { title: "Locatie & Land", description: "Waar bevindt je club zich?", icon: "🌍" },
    { title: "Banen Toevoegen", description: "Configureer je sportvelden", icon: "🎾" },
    { title: "Prijzen Instellen", description: "Bepaal je tarieven", icon: "💰" },
    { title: "Klaar!", description: "Start met boekingen", icon: "🎉" }
];

const COUNTRIES = [
    { code: 'NL', name: '🇳🇱 Nederland', currency: '€', sportRate: 9, goodsRate: 21 },
    { code: 'BE', name: '🇧🇪 België', currency: '€', sportRate: 6, goodsRate: 21 },
    { code: 'DE', name: '🇩🇪 Duitsland', currency: '€', sportRate: 7, goodsRate: 19 },
    { code: 'FR', name: '🇫🇷 Frankrijk', currency: '€', sportRate: 5.5, goodsRate: 20 },
    { code: 'ES', name: '🇪🇸 Spanje', currency: '€', sportRate: 10, goodsRate: 21 },
    { code: 'UK', name: '🇬🇧 Verenigd Koninkrijk', currency: '£', sportRate: 0, goodsRate: 20 },
    { code: 'US', name: '🇺🇸 Verenigde Staten', currency: '$', sportRate: 0, goodsRate: 8 },
    { code: 'CA', name: '🇨🇦 Canada', currency: 'C$', sportRate: 5, goodsRate: 13 },
    { code: 'AU', name: '🇦🇺 Australië', currency: 'A$', sportRate: 0, goodsRate: 10 },
    { code: 'JP', name: '🇯🇵 Japan', currency: '¥', sportRate: 8, goodsRate: 10 },
    { code: 'BR', name: '🇧🇷 Brazilië', currency: 'R$', sportRate: 0, goodsRate: 17 },
    { code: 'MX', name: '🇲🇽 Mexico', currency: '$', sportRate: 0, goodsRate: 16 },
    { code: 'SG', name: '🇸🇬 Singapore', currency: 'S$', sportRate: 0, goodsRate: 9 },
    { code: 'IN', name: '🇮🇳 India', currency: '₹', sportRate: 0, goodsRate: 18 },
    { code: 'AE', name: '🇦🇪 UAE', currency: 'AED', sportRate: 0, goodsRate: 5 },
];

export default function ClubOnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Form data
    const [clubName, setClubName] = useState('');
    const [clubDescription, setClubDescription] = useState('');
    const [countryCode, setCountryCode] = useState('NL');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [courts, setCourts] = useState([
        { name: 'Baan 1', sport: 'padel', maxPlayers: 4, hourlyRate: 37.50 }
    ]);

    const selectedCountry = COUNTRIES.find(c => c.code === countryCode);

    const addCourt = () => {
        setCourts([...courts, {
            name: `Baan ${courts.length + 1}`,
            sport: 'padel',
            maxPlayers: 4,
            hourlyRate: 37.50
        }]);
    };

    const removeCourt = (index: number) => {
        setCourts(courts.filter((_, i) => i !== index));
    };

    const updateCourt = (index: number, field: string, value: any) => {
        const updated = [...courts];
        updated[index] = { ...updated[index], [field]: value };
        setCourts(updated);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Create club
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .insert({
                    name: clubName,
                    description: clubDescription,
                    country_code: countryCode,
                    address,
                    city,
                    owner_id: user.id
                })
                .select()
                .single();

            if (clubError) throw clubError;

            // Create courts
            const courtsData = courts.map(court => ({
                club_id: club.id,
                name: court.name,
                sport: court.sport,
                max_players: court.maxPlayers,
                hourly_rate: court.hourlyRate,
                status: 'active'
            }));

            const { error: courtsError } = await supabase
                .from('courts')
                .insert(courtsData);

            if (courtsError) throw courtsError;

            // Success!
            setCurrentStep(4);
            setTimeout(() => {
                router.push('/admin/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error('Onboarding error:', error);
            alert(`Fout: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return clubName.trim().length > 0;
            case 1: return countryCode && city.trim().length > 0;
            case 2: return courts.length > 0;
            case 3: return courts.every(c => c.hourlyRate > 0);
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-4">
                        {STEPS.map((step, index) => (
                            <div key={index} className="flex-1">
                                <div className={`h-2 rounded-full transition-all ${index <= currentStep ? 'bg-blue-500' : 'bg-white/10'
                                    }`}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                        {STEPS.map((step, index) => (
                            <span key={index} className={index === currentStep ? 'text-blue-400 font-bold' : ''}>
                                {step.icon} {step.title}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">{STEPS[currentStep].icon}</div>
                        <h2 className="text-3xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
                        <p className="text-gray-400">{STEPS[currentStep].description}</p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">
                        {/* Step 0: Club Info */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Club Naam *</label>
                                    <input
                                        type="text"
                                        value={clubName}
                                        onChange={(e) => setClubName(e.target.value)}
                                        placeholder="Bijv: PadelDam Amsterdam"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Beschrijving (optioneel)</label>
                                    <textarea
                                        value={clubDescription}
                                        onChange={(e) => setClubDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Vertel iets over je club..."
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 1: Location & Country */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Land *</label>
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        {COUNTRIES.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedCountry && (
                                        <div className="mt-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <p className="text-xs text-blue-300 font-bold mb-2">Belastingtarieven voor {selectedCountry.name}:</p>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className="text-gray-400">Sport (baanhuur/lessen):</span>
                                                    <span className="ml-2 text-green-400 font-bold">{selectedCountry.sportRate}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Goederen (winkel):</span>
                                                    <span className="ml-2 text-blue-400 font-bold">{selectedCountry.goodsRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Stad *</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Bijv: Amsterdam"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Adres (optioneel)</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Bijv: Sportlaan 123"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Courts */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                {courts.map((court, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-white font-bold">Baan {index + 1}</span>
                                            {courts.length > 1 && (
                                                <button
                                                    onClick={() => removeCourt(index)}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Verwijder
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Sport</label>
                                                <select
                                                    value={court.sport}
                                                    onChange={(e) => updateCourt(index, 'sport', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                                >
                                                    <option value="padel">Padel</option>
                                                    <option value="tennis">Tennis</option>
                                                    <option value="squash">Squash</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Max Spelers</label>
                                                <select
                                                    value={court.maxPlayers}
                                                    onChange={(e) => updateCourt(index, 'maxPlayers', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                                >
                                                    <option value={2}>2 (Single)</option>
                                                    <option value={4}>4 (Double)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addCourt}
                                    className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Baan Toevoegen
                                </button>
                            </div>
                        )}

                        {/* Step 3: Pricing */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                                    <p className="text-xs text-blue-300">
                                        💡 Prijzen zijn exclusief BTW. Het systeem berekent automatisch {selectedCountry?.sportRate}% BTW voor baanhuur.
                                    </p>
                                </div>
                                {courts.map((court, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-bold">{court.name}</p>
                                                <p className="text-xs text-gray-400">{court.sport} • {court.maxPlayers} spelers</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.50"
                                                    min="0"
                                                    value={court.hourlyRate}
                                                    onChange={(e) => updateCourt(index, 'hourlyRate', parseFloat(e.target.value))}
                                                    className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-right font-mono"
                                                />
                                                <span className="text-gray-400">{selectedCountry?.currency}/uur</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {currentStep === 4 && (
                            <div className="text-center py-12">
                                <div className="text-8xl mb-6">🎉</div>
                                <h3 className="text-2xl font-bold text-white mb-4">Je club is klaar!</h3>
                                <p className="text-gray-400 mb-6">
                                    {clubName} is succesvol aangemaakt met {courts.length} {courts.length === 1 ? 'baan' : 'banen'}.
                                </p>
                                <div className="inline-block px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold">
                                    Doorsturen naar dashboard...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    {currentStep < 4 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Vorige
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!canProceed() || isSubmitting}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Bezig...
                                    </>
                                ) : currentStep === 3 ? (
                                    <>
                                        Voltooien
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        Volgende
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
