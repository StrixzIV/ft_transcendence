import { navigate } from "../router";

function shuffleArray(array: Array<string>): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

export async function tournamentMainPage() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <!-- Tournament Bracket Section -->
        <div id="tournament-bracket" class="m-6">
            <h2 class="text-3xl font-bold text-center mb-6">TOURNAMENT BRACKET</h2>
            
            <!-- Semi-finals -->
            <h3 class="font-bold text-2xl text-center mb-4">SEMI-FINAL MATCHES</h3>
            <div id="semifinals" class="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                <!-- Match: Semi-Final 1 -->
                <div class="card md:w-1/2">
                    <h3 class="font-bold text-lg text-center mb-2">SEMI-FINAL #1</h3>
                    <div id="match-1" class="flex flex-col items-center gap-2">
                        <div class="player text-gray-800 p-2 bg-[#ddd] rounded-md w-full text-center">[ Player A ]</div>
                        <span class="font-bold text-sm">VS</span>
                        <div class="player text-gray-800 p-2 bg-[#ddd] rounded-md w-full text-center">[ Player B ]</div>
                    </div>
                    <div class="mt-4 flex justify-center gap-2">
                        <button class="semifinals-btn bg-[#de8a0d] hover:bg-[#fcaa2f] font-semibold py-2 px-4 rounded transition w-2/5 disabled:text-[#999] disabled:bg-[#222] border border-[#444]" data-match-id="1">START SEMI-FINAL #1</button>
                    </div>
                </div>
                <!-- Match: Semi-Final 2 -->
                <div class="card md:w-1/2">
                    <h3 class="font-bold text-lg text-center mb-2">SEMI-FINAL #2</h3>
                    <div id="match-2" class="flex flex-col items-center gap-2">
                        <div class="player text-gray-800 p-2 bg-[#ddd] rounded-md w-full text-center">[ Player C ]</div>
                        <span class="font-bold text-sm">VS</span>
                        <div class="player text-gray-800 p-2 bg-[#ddd] rounded-md w-full text-center">[ Player D ]</div>
                    </div>
                    <div class="mt-4 flex justify-center gap-2">
                        <button class="semifinals-btn bg-[#de8a0d] hover:bg-[#fcaa2f] font-semibold py-2 px-4 rounded transition w-2/5 disabled:text-[#999] disabled:bg-[#222] border border-[#444]" data-match-id="2">START SEMI-FINAL #2</button>
                    </div>
                </div>
            </div>

            <!-- Final -->
            <div id="final-round" class="mt-12 flex flex-col items-center">
                <h3 class="font-bold text-2xl text-center mb-4">FINAL MATCH</h3>
                <div class="card w-full max-w-sm">
                    <h3 class="font-bold text-lg text-center mb-2">FINAL</h3>
                    <div id="final-match" class="flex flex-col items-center gap-2">
                        <div id="finalist-1" class="finalist p-2 text-gray-800 bg-[#ddd] rounded-md w-full text-center">[ Winner of SF1 ]</div>
                        <span class="font-bold text-sm">VS</span>
                        <div id="finalist-2" class="finalist p-2 text-gray-800 bg-[#ddd] rounded-md w-full text-center">[ Winner of SF2 ]</div>
                    </div>
                    <div class="mt-4 flex justify-center gap-2">
                        <button id="start-final-btn" class="hidden bg-[#de8a0d] hover:bg-[#fcaa2f] font-semibold py-2 px-4 rounded transition w-2/5 disabled:text-[#999] disabled:bg-[#222] border border-[#444]" data-match-id="3">START FINAL</button>
                    </div>
                </div>
            </div>

            <div id="tournament-winner" class="caret-red-50 mt-8 text-center p-6 !bg-green-900 border border-green-800 rounded-xl hidden">
                <h2 class="text-2xl font-bold">🏆 THE WINNER: <span id="winner-name"></span> 🏆</h2>
            </div>
        
            
            <div class="mt-8 flex justify-center">
                <button id="reset-btn" class="form-button-red !font-bold !w-40">LEAVE</button>
            </div>

        </div>
    
    `;

    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const startFinalBtn = document.getElementById('start-final-btn') as HTMLButtonElement;

    const winnerDiv = document.getElementById('tournament-winner') as HTMLDivElement;
    const winnerNameSpan = document.getElementById('winner-name') as HTMLSpanElement;

    let players = JSON.parse(localStorage.getItem('players') ?? '[]') as Array<string>;
    shuffleArray(players);

    if (!localStorage.getItem('matches') && players.length == 4) {
        localStorage.setItem('matches', JSON.stringify(
            [
                { id: 1, players: [players[0], players[1]], winner: null },
                { id: 2, players: [players[2], players[3]], winner: null },
                { id: 3, players: [], winner: null }
            ]
        ))
    }

    let matches = JSON.parse(localStorage.getItem('matches') ?? '[]') as Array<{players: Array<string>, winner: string}>;

    if (matches[0].winner) {
        document.getElementById('finalist-1')!.textContent = matches[0].winner;
        (document.querySelector('[data-match-id="1"]') as HTMLButtonElement).disabled = true;
    }

    if (matches[1].winner) {
        document.getElementById('finalist-2')!.textContent = matches[1].winner;
        (document.querySelector('[data-match-id="2"]') as HTMLButtonElement).disabled = true;
    }

    if (matches[0].winner && matches[1].winner) {
        matches[2].players = [matches[0].winner, matches[1].winner]
        localStorage.setItem('matches', JSON.stringify(matches))
        startFinalBtn.classList.remove('hidden')
    }
    
    const semifinal1El = document.getElementById('match-1');
    const semifinal2El = document.getElementById('match-2');
    
    semifinal1El!.children[0].textContent = matches[0].players[0];
    semifinal1El!.children[2].textContent = matches[0].players[1];
    
    semifinal2El!.children[0].textContent = matches[1].players[0];
    semifinal2El!.children[2].textContent = matches[1].players[1];

    if (matches[2].winner) {
        winnerDiv.classList.remove('hidden');
        winnerNameSpan.textContent = matches[2].winner;
        startFinalBtn.disabled = true;
    }

    resetBtn.addEventListener('click', async () => {
        localStorage.removeItem('players');
        localStorage.removeItem('matches');
        await navigate('/');
    });

    startFinalBtn.addEventListener('click', async () => {
        await navigate(`/tournament-game?matchId=3`);
    });

    document.querySelectorAll('.semifinals-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const matchId = Number((e.target as HTMLButtonElement).dataset.matchId);
            await navigate(`/tournament-game?matchId=${matchId}`)
        });
    });

}
