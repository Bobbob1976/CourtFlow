'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { createPublicBooking } from '@/app/actions/booking-actions';

export default function BookingPage() {
  const { clubId } = useParams(); // clubId is actually subdomain
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState(60); // Default 60 minutes

  // Succes state voor "Dopamine" effect
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // 1. Get Club
      // Check if clubId looks like a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(Array.isArray(clubId) ? clubId[0] : clubId);

      let query = supabase.from('clubs').select('*');

      if (isUuid) {
        query = query.eq('id', clubId);
      } else {
        query = query.eq('subdomain', clubId);
      }

      const { data: clubData } = await query.single();

      if (clubData) {
        setClub(clubData);

        // 2. Get Courts (Real courts!)
        const { data: courtsData } = await supabase
          .from('courts')
          .select('*')
          .eq('club_id', clubData.id)
          .order('name');

        setCourts(courtsData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [clubId]);



  const handleBooking = async (courtId: string, time: string) => {
    setProcessingBooking(true);
    try {
      // Formatteer datum als YYYY-MM-DD
      const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format trick

      const price = (duration / 60) * 20; // €20 per uur (basis)

      const result = await createPublicBooking({
        clubId: club.id,
        courtId: courtId,
        date: dateStr,
        startTime: time,
        duration: duration,
        price: price
      });

      if (result.success) {
        handleSuccess();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Er ging iets mis.");
    } finally {
      setProcessingBooking(false);
    }
  };

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

  // Smart Share Functionality
  const handleInvite = async () => {
    const shareData = {
      title: 'Potje Padel? 🎾',
      text: `Ik heb een baan geboekt bij ${club?.name || 'de club'}! Doe je mee? 🏆`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Uitnodiging gekopieerd! Plak het in WhatsApp. 📋');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };


  if (loading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white">Laden...</div>;

  // DYNAMIC STYLING UTILS
  const primaryColor = club?.primary_color || '#C4FF0D';
  const bannerUrl = club?.banner_url || 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2670'; // Fallback Padel Court

  // SUCCESS SCREEN (Dopamine!)
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="relative z-10 animate-bounce mb-8">
          <span className="text-8xl">🏆</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4">Gefeliciteerd!</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-md">
          Je training op <span style={{ color: primaryColor }} className="font-bold">Baan 3</span> staat vast.
          Tijd om te knallen!
        </p>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Datum</span>
            <span className="font-bold text-white">
              {selectedDate.getDate()} {selectedDate.toLocaleString('nl-NL', { month: 'short' })}
            </span>
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
          <button
            onClick={handleInvite}
            style={{ backgroundColor: primaryColor }}
            className="px-8 py-4 text-[#0A1628] font-bold rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
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
          src={bannerUrl}
          className="w-full h-full object-cover opacity-60"
          alt="Club Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 w-full max-w-7xl mx-auto">
          <span
            style={{ backgroundColor: primaryColor }}
            className="px-3 py-1 text-[#0A1628] font-bold text-xs rounded uppercase mb-4 inline-block"
          >
            Premium Partner
          </span>

          {/* LOGO */}
          {club?.logo_url && (
            <img
              src={club.logo_url}
              className="w-20 h-20 mb-4 rounded-xl object-contain bg-white/10 backdrop-blur border border-white/20 p-2"
              alt="Logo"
            />
          )}

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
                style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected
                  ? 'text-[#0A1628] scale-105 shadow-[0_0_20px_rgba(196,255,13,0.3)]'
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

        {/* Duration Selector */}
        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
          {[60, 90, 120].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${duration === d
                ? 'text-[#0A1628] scale-105'
                : 'bg-[#132338] text-gray-400 border border-white/10 hover:border-white/30'
                }`}
              style={duration === d ? { backgroundColor: primaryColor } : {}}
            >
              {d} min
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span style={{ backgroundColor: primaryColor }} className="w-1 h-6 rounded-full"></span>
          Kies je baan
        </h2>

        {/* COURT CARDS (Padel Images) */}
        {/* REAL COURTS GRID */}
        {courts.length === 0 ? (
          <div className="text-gray-500 text-center py-12 bg-[#132338] rounded-3xl border border-white/5">
            <p className="text-xl font-bold text-white">Geen banen gevonden</p>
            <p className="text-sm text-gray-400 mt-2">Er zijn nog geen banen aangemaakt voor deze club.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courts.map((court: any) => (
              <div key={court.id} className="bg-[#132338] rounded-3xl overflow-hidden border border-white/5 group hover:border-[#C4FF0D]/50 transition-colors shadow-lg">
                <div className="h-48 relative overflow-hidden bg-gray-800">
                  <img
                    src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=60" // Placeholder
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={court.name}
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                    {court.type || 'Padel Court'}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{court.name}</h3>
                      <p className="text-sm text-gray-400">Professional Court • LED</p>
                    </div>
                    <div className="text-right">
                      <div style={{ color: primaryColor }} className="font-bold text-lg">€{((duration / 60) * 20).toFixed(2).replace('.', ',')}</div>
                      <div className="text-xs text-gray-500">per {duration} min</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'].map(time => (
                      <button
                        key={time}
                        onClick={() => handleBooking(court.id, time)}
                        disabled={processingBooking}
                        className="py-2 rounded-xl bg-[#0A1628] border border-white/10 text-sm font-bold transition-all hover:scale-105 hover:text-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed"
                        onMouseEnter={(e) => {
                          if (!processingBooking) {
                            e.currentTarget.style.backgroundColor = primaryColor;
                            e.currentTarget.style.borderColor = primaryColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processingBooking) {
                            e.currentTarget.style.backgroundColor = '#0A1628';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#fff';
                          }
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
