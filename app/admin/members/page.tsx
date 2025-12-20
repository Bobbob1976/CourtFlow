import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default async function AdminMembersPage() {
    const supabase = createClient();

    // Fetch profiles with ratings (filtered by demo club)
    const { data: members, error } = await supabase
        .from("user_profiles")
        .select(`
            *,
            rating:player_ratings(current_rating, matches_played, last_active)
        `)
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96')
        .order("created_at", { ascending: false });

    console.log('Members query:', { count: members?.length, error });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Member Management</h1>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        Add Member
                    </button>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">ELO Rating</th>
                                <th className="px-6 py-4">Matches</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members?.map((member) => (
                                <MemberRow key={member.id} member={member} />
                            ))}
                            {(!members || members.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MemberRow({ member }: { member: any }) {
    const rating = member.rating?.[0]; // It's an array because of 1:many relation potentially, though usually 1:1
    const lastActive = rating?.last_active ? new Date(rating.last_active) : null;

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {member.full_name?.[0] || '?'}
                    </div>
                    <div>
                        <div className="font-bold text-white">{member.full_name || 'Unknown'}</div>
                        <div className="text-gray-500 text-xs">{member.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
                    MEMBER
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">{rating?.current_rating?.toFixed(2) || '2.50'}</span>
                    {/* Trend indicator could go here */}
                </div>
            </td>
            <td className="px-6 py-4 text-gray-300">
                {rating?.matches_played || 0}
            </td>
            <td className="px-6 py-4 text-gray-500 text-xs">
                {lastActive ? format(lastActive, "d MMM yyyy", { locale: nl }) : 'Never'}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </button>
            </td>
        </tr>
    )
}
