"use client";

interface Player {
    id: string;
    name: string;
    avatar_url?: string;
}

interface FacepileProps {
    players: Player[];
    maxVisible?: number;
}

export default function Facepile({ players, maxVisible = 4 }: FacepileProps) {
    const visiblePlayers = players.slice(0, maxVisible);
    const remainingCount = Math.max(0, players.length - maxVisible);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const colors = [
        'from-blue-500 to-cyan-400',
        'from-purple-500 to-pink-400',
        'from-orange-500 to-red-400',
        'from-green-500 to-emerald-400',
    ];

    return (
        <div className="flex items-center -space-x-3">
            {visiblePlayers.map((player, index) => (
                <div
                    key={player.id}
                    className="relative group"
                    style={{ zIndex: visiblePlayers.length - index }}
                >
                    {player.avatar_url ? (
                        <img
                            src={player.avatar_url}
                            alt={player.name}
                            className="w-10 h-10 rounded-full border-2 border-slate-900 ring-2 ring-white/10 transition-transform group-hover:scale-110 group-hover:ring-blue-500/50"
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 rounded-full border-2 border-slate-900 ring-2 ring-white/10 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${colors[index % colors.length]} transition-transform group-hover:scale-110 group-hover:ring-blue-500/50 shadow-lg`}
                        >
                            {getInitials(player.name)}
                        </div>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                        {player.name}
                    </div>
                </div>
            ))}

            {remainingCount > 0 && (
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 ring-2 ring-white/10 flex items-center justify-center text-xs font-bold text-gray-400 bg-slate-800">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
