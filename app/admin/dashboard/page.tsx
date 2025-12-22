import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import ForecastWidget from "@/components/admin/ForecastWidget";
import VisualCourtGrid from "@/components/admin/VisualCourtGrid";

export default async function AdminDashboard() {
    const supabase = createClient();

    // 1. Fetch Real Club Data
    const { data: clubs } = await supabase.from('clubs').select('id, name').limit(1);
    const club = clubs?.[0];

    if (!club) return <div className="p-8 text-white">Laden... (Geen club gevonden)</div>;

    // 2. Fetch Basic Stats (Real Revenue)
    const { data: bookings } = await supabase
        .from('bookings')
        .select('total_cost')
        .eq('club_id', club.id)
        .is('cancelled_at', null);

    const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) || 0;

    // Mock other stats for now (will implement later)
    const stats = [
        { title: "Totale Omzet", value: `€${totalRevenue.toLocaleString('nl-NL')}`, trend: "+12%", trendUp: true, sparkline: "blue" },
        { title: "Actieve Leden", value: "15", trend: "+5%", trendUp: true, sparkline: "green" },
        { title: "Baan Bezetting", value: "85%", trend: "-2%", trendUp: false, sparkline: "purple" },
        { title: "Actie Punten", value: "3", trend: "Urgent", trendUp: false, sparkline: "red" },
    ];

    const recentActions = [
        { type: "Booking", desc: "Court 1 reserved by Mike", user: "Mike Johnson", time: "2 min ago", status: "resolved" },
        { type: "Payment", desc: "Failed transaction #492", user: "Sarah Connor", time: "15 min ago", status: "failed" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welkom terug bij {club.name}</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <KPICard key={i} {...stat} />
                ))}
            </div>

            {/* AI Forecast Widget - KILLER FEATURE */}
            <ForecastWidget />

            {/* Visual Court Grid - FULL WIDTH */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Live Baan Status</h3>
                <VisualCourtGrid clubId={club.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder -> Link to Financials */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center relative overflow-hidden group hover:border-[#C4FF0D]/50 transition-colors cursor-pointer">
                        <a href="/admin/financials" className="absolute inset-0 z-20"></a>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-center z-10">
                            <p className="text-gray-400 font-medium mb-2">Bekijk Gedetailleerd Financieel Rapport</p>
                            <p className="text-3xl font-bold text-white">Naar Financials &rarr;</p>
                        </div>
                    </div>
                </div>

                {/* Action Items */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6">Recente Activiteit</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {recentActions.map((action, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${action.status === 'failed' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                        action.status === 'warning' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' :
                                            'text-green-400 border-green-500/20 bg-green-500/10'
                                        }`}>{action.type.toUpperCase()}</span>
                                    <span className="text-xs text-gray-500">{action.time}</span>
                                </div>
                                <p className="text-sm font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{action.desc}</p>
                                <p className="text-xs text-gray-400">by {action.user}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, trendUp, sparkline }: any) {
    const colors: any = {
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        green: "text-green-400 border-green-500/20 bg-green-500/5",
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
        red: "text-red-400 border-red-500/20 bg-red-500/5",
    };
    const colorClass = colors[sparkline] || colors.blue;

    return (
        <div className={`p-5 rounded-xl border ${colorClass} relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trend}
                </span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {/* Fake Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0 15 Q 20 18, 40 10 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
    )
}
