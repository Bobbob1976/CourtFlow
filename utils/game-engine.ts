export type Player = {
    id: string;
    rating: number;
    matchesPlayed: number;
};

export type MatchData = {
    team1: [Player, Player];
    team2: [Player, Player];
    scores: Array<[number, number]>; // e.g. [[6,0], [6,0]]
};

export type RatingUpdate = {
    playerId: string;
    oldRating: number;
    newRating: number;
    change: number;
};

/**
 * Calculates new ratings for all 4 players based on match outcome.
 * Uses ELO-like algorithm with Margin Multiplier and Dynamic K-Factor.
 */
export function calculateNewRatings(match: MatchData): RatingUpdate[] {
    // Constants
    const BASE_K_ROOKIE = 50; // High volatility for new players
    const BASE_K_NORMAL = 20; // Standard volatility
    const ROOKIE_MATCH_LIMIT = 5;
    const SCALE_FACTOR = 400; // Standard ELO scale factor. 
    // Note: If using 0-10 scale, we might need to adjust this or normalize ratings.
    // For 2.50 scale (NTRP-like), a difference of 0.5 is huge.
    // Let's assume the input ratings are on the 2.50 scale.
    // We need to scale the difference to match ELO probabilities.
    // E.g. 0.5 difference in NTRP might be equivalent to ~200-300 ELO points?
    // Let's use a multiplier for the logistic curve input.
    const RATING_SCALE_MULTIPLIER = 400; // If 1.0 diff = 90% win chance roughly.

    // Stap A: Bereken gemiddelde rating van Team 1 en Team 2
    const avgRatingT1 = (match.team1[0].rating + match.team1[1].rating) / 2;
    const avgRatingT2 = (match.team2[0].rating + match.team2[1].rating) / 2;

    // Stap B: Bereken "Expected Score" (Kans op winst)
    // Formula: 1 / (1 + 10 ^ ((RatingB - RatingA) / 400))
    // We multiply the difference by RATING_SCALE_MULTIPLIER to map small float diffs to ELO-like diffs if needed.
    // If ratings are 2.5, 3.0 etc, a diff of 0.5 is significant.
    // If we treat 1.0 diff as 400 ELO points:
    const diff = (avgRatingT2 - avgRatingT1) * RATING_SCALE_MULTIPLIER;
    const expectedScoreT1 = 1 / (1 + Math.pow(10, diff / 400));
    const expectedScoreT2 = 1 - expectedScoreT1;

    // Determine Actual Score
    let gamesT1 = 0;
    let gamesT2 = 0;
    match.scores.forEach(set => {
        gamesT1 += set[0];
        gamesT2 += set[1];
    });

    const actualScoreT1 = gamesT1 > gamesT2 ? 1 : 0;
    const actualScoreT2 = 1 - actualScoreT1;

    // Stap C: Bereken "Margin Multiplier"
    const gameDiff = Math.abs(gamesT1 - gamesT2);
    const totalGames = gamesT1 + gamesT2;

    // Dominance factor: 1.0 (close) to ~2.0 (total destruction)
    let marginMultiplier = 1.0;
    if (totalGames > 0) {
        const dominance = gameDiff / totalGames; // 0.0 to 1.0
        marginMultiplier = 1 + dominance;
    }

    // Stap D: Update per INDIVIDU
    const updatePlayer = (player: Player, actual: number, expected: number, multiplier: number): RatingUpdate => {
        // Dynamic K-Factor
        // Since we are on a small scale (e.g. 2.50), K needs to be small too?
        // Or we calculate change in "ELO points" and then divide by scale?
        // Let's assume K is scaled for the 2.50 system directly.
        // If K=50 on 2.50 scale, a single match could swing rating by 50 * 1 * 1 = 50.0! Too big.
        // Standard ELO K=32 means max swing is 32 points on 2000 scale (1.6%).
        // On 5.0 scale, 1.6% is 0.08.
        // So K should be around 0.1 to 0.5.
        // BUT user requested K=50 and K=20. 
        // Maybe user assumes we convert to ELO (1200), calculate, and convert back?
        // OR user wants big swings?
        // Let's assume we calculate in "ELO points" (x100 or x400) and then apply?
        // OR we just use a smaller K.
        // Let's use a divisor to normalize the user's K request to the small scale.
        // If user wants K=50 for rookies, maybe that means 0.50?
        const K_SCALE = 0.01; // Scale down the K factor

        const rawK = player.matchesPlayed < ROOKIE_MATCH_LIMIT ? BASE_K_ROOKIE : BASE_K_NORMAL;
        const K = rawK * K_SCALE;

        const change = K * multiplier * (actual - expected);
        const newRating = player.rating + change;

        return {
            playerId: player.id,
            oldRating: player.rating,
            newRating: Math.round(newRating * 100) / 100, // Round to 2 decimals
            change: Math.round(change * 100) / 100
        };
    };

    const updates = [
        ...match.team1.map(p => updatePlayer(p, actualScoreT1, expectedScoreT1, marginMultiplier)),
        ...match.team2.map(p => updatePlayer(p, actualScoreT2, expectedScoreT2, marginMultiplier))
    ];

    return updates;
}
