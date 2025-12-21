'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function BookingPage() {
  const { clubId } = useParams(); // clubId is actually subdomain
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Succes state voor "Dopamine" effect
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // 1. Get Club
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('subdomain', clubId)
        .single();

      if (clubData) setClub(clubData);
      setLoading(false);
    }
    loadData();
  }, [clubId]);

  // Trigger Confetti
  const handleSuccess = () => {
    setBookingSuccess(true);
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (loading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white">Laden...</div>;

  // SUCCESS SCREEN (Dopamine!)
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="relative z-10 animate-bounce mb-8">
          <span className="text-8xl">🏆</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4">Gefeliciteerd!</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-md">
          Je training op <span className="text-[#C4FF0D] font-bold">Baan 3</span> staat vast.
          Tijd om te knallen!
        </p>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Datum</span>
            <span className="font-bold text-white">Vandaag, 14 mei</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Tijd</span>
            <span className="font-bold text-white">19:00 - 20:30</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Locatie</span>
            <span className="font-bold text-white">{club?.name || 'Club'}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-8 py-4 bg-[#C4FF0D] text-[#0A1628] font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#C4FF0D]/20">
            Invite Friends
          </button>
          <button onClick={() => router.push('/dashboard')} className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
            Naar Dashboard
          </button>
        </div>
      </div>
    );
  }

  // BOOKING SCREEN
  return (
    <div className="min-h-screen bg-[#0A1628] text-white font-sans pb-20">

      {/* Header Image */}
      <div className="relative h-[40vh]">
        <img
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-60"
          alt="Club"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 w-full max-w-7xl mx-auto">
          <span className="px-3 py-1 bg-[#C4FF0D] text-[#0A1628] font-bold text-xs rounded uppercase mb-4 inline-block">
            Premium Partner
          </span>
          <h1 className="text-5xl font-extrabold mb-2">{club?.name || 'Club Naam'}</h1>
          <p className="text-gray-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Amsterdam, Nederland • 8 Padel Banen
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">

        {/* Filter / Date Picker */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[0, 1, 2, 3, 4, 5, 6].map(days => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            const isSelected = selectedDate.getDate() === date.getDate();

            return (
              <button
                key={days}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected
                    ? 'bg-[#C4FF0D] border-[#C4FF0D] text-[#0A1628] scale-105 shadow-[0_0_20px_rgba(196,255,13,0.3)]'
                    : 'bg-[#132338] border-white/5 text-gray-400 hover:border-white/20'
                  }`}
              >
                <span className="text-xs font-bold uppercase mb-1">
                  {date.toLocaleDateString('nl-NL', { weekday: 'short' })}
                </span>
                <span className="text-2xl font-bold">
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#C4FF0D] rounded-full"></span>
          Kies je baan
        </h2>

        {/* COURT CARDS (Correct Padel Images) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { name: 'Center Court', type: 'Indoor', label: '🏆 Main Court', img: 'https://images.unsplash.com/photo-1626248677610-d027dc8bc19d?q=80&w=800&auto=format&fit=crop' },
            { name: 'Baan 2 (Panoramic)', type: 'Indoor', label: '🌟 Panoramic', img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop' },
            { name: 'Baan 3', type: 'Outdoor', label: '☀️ Outdoor', img: 'https://images.unsplash.com/photo-1599586120429-48285b6a7a81?q=80&w=800&auto=format&fit=crop' },
            { name: 'Baan 4', type: 'Outdoor', label: '🎾 Standard', img: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop' }
          ].map((court, idx) => (
            <div key={idx} className="bg-[#132338] rounded-3xl overflow-hidden border border-white/5 group hover:border-[#C4FF0D]/50 transition-colors shadow-lg">
              {/* Court Image - Crucial for Product Visualization */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={court.img}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={court.name}
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                  {court.label}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{court.name}</h3>
                    <p className="text-sm text-gray-400">{court.type} • WPT Gras • LED verlichting</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#C4FF0D] font-bold text-lg">€30,00</div>
                    <div className="text-xs text-gray-500">per 90 min</div>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-4 gap-2">
                  {['16:00', '17:30', '19:00', '20:30'].map(time => (
                    <button
                      key={time}
                      onClick={handleSuccess}
                      className="py-2 rounded-xl bg-[#0A1628] border border-white/10 text-sm font-bold hover:bg-[#C4FF0D] hover:text-[#0A1628] hover:border-[#C4FF0D] transition-all hover:scale-105"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
