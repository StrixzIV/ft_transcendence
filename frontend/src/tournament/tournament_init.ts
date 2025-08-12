import { navigate } from "../router";

export function tournamentSetupPage() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <!-- Player Input and List Section -->
        <div id="player-setup" class="m-8 p-6 card text-xl">
            <h2 class="mb-4 text-large font-semibold">ADD PLAYERS</h2>
            <div class="flex gap-4">
                <input type="text" id="player-name-input" placeholder="Enter player name" class="form-field w-4/5">
                <button id="add-player-btn" class="bg-[#444] hover:bg-[#555] disabled:bg-gray-400 transition font-semibold py-2 rounded w-1/5 border border-[#555]">Add Player</button>
            </div>
            <div id="player-list-container" class="mt-4">
                <h3 class="text-lg font-medium mb-2">Players Added (<span id="player-count">0</span>/4):</h3>
                <ul id="player-list" class="space-y-2">
                    <!-- Player list items will be inserted here -->
                </ul>
            </div>
            <div class="mt-6 flex justify-center">
                <button id="start-tournament-btn" class="bg-green-600 text-white disabled:text-[#999] font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-[#222] border border-[#444]" disabled>Start Tournament</button>
            </div>
        </div>
    `;

    if (localStorage.getItem('players') && !localStorage.getItem('matches')) {
        localStorage.setItem('players', JSON.stringify([]))
    }

    let players = JSON.parse(localStorage.getItem('players') ?? '[]') as Array<string>;

    const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
    const addPlayerBtn = document.getElementById('add-player-btn') as HTMLButtonElement;
    const playerList = document.getElementById('player-list') as HTMLUListElement;
    const playerCountSpan = document.getElementById('player-count') as HTMLSpanElement;
    const startTournamentBtn = document.getElementById('start-tournament-btn') as HTMLButtonElement;

    const renderPlayerList = () => {

        playerList.innerHTML = '';
        
        players.forEach(player => {
            const li = document.createElement('li');
            li.className = "bg-[#ddd] p-3 rounded-md shadow-sm border border-gray-200 text-gray-800";
            li.textContent = player;
            playerList.appendChild(li);
        });
        
        playerCountSpan.textContent = players.length.toString();
        
        // Enable or disable the start button based on player count
        startTournamentBtn.disabled = players.length !== 4;
    
    };

    addPlayerBtn.addEventListener('click', () => {

        const specialCharPattern = /[^a-zA-Z0-9 ]/;
        const playerName = playerNameInput.value.trim();

        if (specialCharPattern.test(playerName)) {
            alert('Player name cannot contain special characters.');
            return;
        }
        
        if (playerName && players.length < 4) {
            players.push(playerName);
            localStorage.setItem('players', JSON.stringify(players))
            playerNameInput.value = '';
            renderPlayerList();
        }

    });

    // Handler for the "Enter" key on the input field
    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addPlayerBtn.click();
        }
    });


    startTournamentBtn.addEventListener('click', async () => {
        await navigate('/tournament');
    })

}
