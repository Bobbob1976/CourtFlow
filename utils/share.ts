export async function shareMatch(match: { id: string, clubName: string, date: string }) {
    const inviteLink = `https://courtflow.app/join/${match.id}`;
    const message = `Potje Padel? 🎾 Ik heb een baan geboekt bij ${match.clubName} op ${match.date}. Doe je mee? 👉 ${inviteLink}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title: 'CourtFlow Invite',
                text: message,
                url: inviteLink
            });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        // Fallback: Open WhatsApp directly
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
}
