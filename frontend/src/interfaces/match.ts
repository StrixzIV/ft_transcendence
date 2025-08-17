interface Player {
    id: string;
    match_id: string;
    uid: string;
    side: "leftPlayer" | "rightPlayer";
}

interface MatchDetails {
    id: string;
    gid: string;
    created_at: string;
    ended_at: string;
    left_score: number;
    right_score: number;
    winner_id: string;
    status: "completed";
    players: Player[];
}

export interface Match {
    id: string;
    match_id: string;
    uid: string;
    side: "leftPlayer" | "rightPlayer";
    match: MatchDetails;
}
