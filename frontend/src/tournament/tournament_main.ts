import { navigate } from "../router";

function shuffleArray(array: Array<string>): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

export function tournamentMainPage() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <!-- Tournament Bracket Section -->
        <div id="tournament-bracket">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Tournament Bracket</h2>

            <!-- Semi-finals -->
            <div id="semifinals" class="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                <!-- Match 1 -->
                <div class="bg-gray-100 p-4 rounded-xl w-full md:w-1/2 shadow-sm border border-gray-200">
                    <h3 class="font-bold text-lg text-center text-gray-700 mb-2">Semi-Final 1</h3>
                    <div id="match-1" class="flex flex-col items-center gap-2">
                        <div class="player text-gray-800 p-2 bg-white rounded-md w-full text-center">Player A</div>
                        <span class="text-gray-500 font-bold text-sm">vs</span>
                        <div class="player text-gray-800 p-2 bg-white rounded-md w-full text-center">Player B</div>
                    </div>
                    <div class="mt-4 flex justify-center gap-2">
                        <button class="winner-btn bg-yellow-500 text-white py-1 px-4 rounded-md shadow-sm hover:bg-yellow-600 transition-colors" data-match-id="1">Start Game</button>
                    </div>
                </div>
                <!-- Match 2 -->
                <div class="bg-gray-100 p-4 rounded-xl w-full md:w-1/2 shadow-sm border border-gray-200">
                    <h3 class="font-bold text-lg text-center text-gray-700 mb-2">Semi-Final 2</h3>
                    <div id="match-2" class="flex flex-col items-center gap-2">
                        <div class="player text-gray-800 p-2 bg-white rounded-md w-full text-center">Player C</div>
                        <span class="text-gray-500 font-bold text-sm">vs</span>
                        <div class="player text-gray-800 p-2 bg-white rounded-md w-full text-center">Player D</div>
                    </div>
                    <div class="mt-4 flex justify-center gap-2">
                        <button class="winner-btn bg-yellow-500 text-white py-1 px-4 rounded-md shadow-sm hover:bg-yellow-600 transition-colors" data-match-id="2">Start Game</button>
                    </div>
                </div>
            </div>

            <!-- Final -->
            <div id="final-round" class="mt-12 flex flex-col items-center">
                <h3 class="font-bold text-2xl text-center text-gray-800 mb-4">Finals</h3>
                <div class="bg-gray-100 p-6 rounded-xl w-full max-w-sm shadow-md border border-gray-200">
                    <div id="final-match" class="flex flex-col items-center gap-2">
                        <div class="finalist p-2 text-gray-800 bg-white rounded-md w-full text-center">Winner of SF1</div>
                        <span class="text-gray-500 font-bold text-sm">vs</span>
                        <div class="finalist p-2 text-gray-800 bg-white rounded-md w-full text-center">Winner of SF2</div>
                    </div>
                    <div id="final-winner-btns" class="mt-4 flex justify-center gap-2">
                        <!-- Final winner buttons will be added here -->
                    </div>
                </div>
            </div>

            <div id="tournament-winner" class="hidden mt-8 text-center p-6 bg-green-100 rounded-xl">
                <h2 class="text-2xl font-bold text-green-700">🏆 The Winner Is: <span id="winner-name"></span> 🏆</h2>
            </div>
            
            <div class="mt-8 flex justify-center">
                <button id="reset-btn" class="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-red-700 transition-colors">Leave</button>
            </div>

        </div>
    `;

    // const tournamentBracketSection = document.getElementById('tournament-bracket') as HTMLDivElement;
    // const semifinalsSection = document.getElementById('semifinals') as HTMLDivElement;
    // const finalMatchEl = document.getElementById('final-match') as HTMLDivElement;
    // const finalWinnerBtnsContainer = document.getElementById('final-winner-btns') as HTMLButtonElement;
    // const tournamentWinnerDisplay = document.getElementById('tournament-winner') as HTMLDivElement;
    // const winnerNameSpan = document.getElementById('winner-name') as HTMLSpanElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

    let players = JSON.parse(localStorage.getItem('players') ?? '[]') as Array<string>;
    shuffleArray(players);

    if (!localStorage.getItem('matches')) {
        localStorage.setItem('matches', JSON.stringify(
            [
                { id: 1, players: [players[0], players[1]], winner: null },
                { id: 2, players: [players[2], players[3]], winner: null }
            ]
        ))
    }

    let matches = JSON.parse(localStorage.getItem('matches') ?? '[]') as Array<{players: Array<string>, winner: string}>;
    // let finalMatch = JSON.parse(localStorage.getItem('finalMatch') ?? '{}') as {players: Array<string>, winner: string | null};
    
    const semifinal1El = document.getElementById('match-1');
    const semifinal2El = document.getElementById('match-2');
    
    semifinal1El!.children[0].textContent = matches[0].players[0];
    semifinal1El!.children[2].textContent = matches[0].players[1];
    
    semifinal2El!.children[0].textContent = matches[1].players[0];
    semifinal2El!.children[2].textContent = matches[1].players[1];

    resetBtn.addEventListener('click', async () => {
        localStorage.removeItem('players');
        localStorage.removeItem('matches');
        await navigate('/');
    });

}
