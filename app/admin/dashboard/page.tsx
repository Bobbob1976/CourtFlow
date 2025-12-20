import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import ForecastWidget from "@/components/admin/ForecastWidget";
import SmartForecastWidget from "@/components/admin/SmartForecastWidget";
import VisualCourtGrid from "@/components/admin/VisualCourtGrid";

export default async function AdminDashboard() {
    const supabase = createClient();

    // Fetch real data
    const { data: { user } } = await supabase.auth.getUser();

    // Mock data for now where real data is complex to aggregate quickly in SQL
    // In a real app, we'd have dedicated RPC functions for these stats
    const stats = [
        { title: "Total Revenue", value: "€12,450", trend: "+12%", trendUp: true, sparkline: "blue" },
        { title: "Active Members", value: "1,240", trend: "+5%", trendUp: true, sparkline: "green" },
        { title: "Court Occupancy", value: "85%", trend: "-2%", trendUp: false, sparkline: "purple" },
        { title: "Pending Actions", value: "12", trend: "Urgent", trendUp: false, sparkline: "red" },
    ];

    const courts = [
        { name: "Court 1", status: "active", players: ["Mike", "Sarah", "Tom", "Lisa"], time: "00:45" },
        { name: "Court 2", status: "active", players: ["John", "Doe"], time: "01:15" },
        { name: "Court 3", status: "empty", players: [], time: "" },
        { name: "Court 4", status: "maintenance", players: [], time: "" },
    ];

    const recentActions = [
        { type: "Booking", desc: "Court 1 reserved by Mike", user: "Mike Johnson", time: "2 min ago", status: "resolved" },
        { type: "Payment", desc: "Failed transaction #492", user: "Sarah Connor", time: "15 min ago", status: "failed" },
        { type: "System", desc: "High server load warning", user: "System", time: "1h ago", status: "warning" },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <KPICard key={i} {...stat} />
                ))}
            </div>

            {/* AI Forecast Widget - KILLER FEATURE */}
            <ForecastWidget />

            {/* Smart Forecast & Visual Court Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Smart Forecast Widget */}
                <div className="lg:col-span-1">
                    <SmartForecastWidget clubId="90f93d47-b438-427c-8b33-0597817c1d96" />
                </div>

                {/* Visual Court Grid */}
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">Live Court Status</h3>
                    <VisualCourtGrid clubId="90f93d47-b438-427c-8b33-0597817c1d96" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-center z-10">
                            <p className="text-gray-400 font-medium mb-2">Revenue Split (Padel vs Tennis)</p>
                            <div className="flex items-end gap-2 h-32">
                                <div className="w-8 bg-blue-500 rounded-t-lg h-[60%] animate-pulse"></div>
                                <div className="w-8 bg-purple-500 rounded-t-lg h-[80%] animate-pulse delay-75"></div>
                                <div className="w-8 bg-cyan-500 rounded-t-lg h-[40%] animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Items */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6">Action Items</h3>
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
                    <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        View All Actions
                    </button>
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

function CourtCard({ name, status, players, time }: any) {
    const isMaintenance = status === 'maintenance';
    const isActive = status === 'active';

    return (
        <div className={`p-4 rounded-lg border transition-all ${isActive ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
            isMaintenance ? 'bg-red-900/10 border-red-500/30 opacity-70' :
                'bg-white/5 border-white/5 opacity-50'
            }`}>
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-white text-sm">{name}</span>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : isMaintenance ? 'bg-red-500' : 'bg-gray-600'}`}></span>
            </div>

            {isActive ? (
                <div className="space-y-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        {players.map((p: string, i: number) => (
                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121212] bg-gray-600 flex items-center justify-center text-[10px] font-bold text-white" title={p}>
                                {p[0]}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-green-400 font-mono">{time}</div>
                </div>
            ) : isMaintenance ? (
                <div className="flex items-center justify-center h-12 text-xs text-red-400 font-bold uppercase tracking-widest">
                    Maintenance
                </div>
            ) : (
                <div className="flex items-center justify-center h-12 text-xs text-gray-500 font-mono">
                    Available
                </div>
            )}
        </div>
    )
}

function ActionRow({ type, desc, user, time, status }: any) {
    const statusColors: any = {
        failed: "text-red-400 bg-red-500/10 border-red-500/20",
        warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        resolved: "text-green-400 bg-green-500/10 border-green-500/20",
    };

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-medium text-white">{type}</td>
            <td className="px-6 py-4">{desc}</td>
            <td className="px-6 py-4 text-gray-300">{user}</td>
            <td className="px-6 py-4 font-mono text-xs">{time}</td>
            <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded border ${statusColors[status]}`}>
                    {status.toUpperCase()}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-blue-400 hover:text-white text-xs font-bold">RESOLVE</button>
            </td>
        </tr>
    )
}
