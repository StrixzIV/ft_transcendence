function remoteGameModal() {
    return `
    <div id="remote-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
        <div class="bg-[#1a1a1a] p-6 rounded shadow-md text-white relative border border-[#444] w-4xl">
            
            <button id="close-remote" class="absolute top-2 right-2 text-xl">&times;</button>
            <h2 class="text-2xl mb-4 font-semibold">REMOTE GAME</h2>

            <div class="flex gap-4">
                <input type="text" id="room-field" placeholder="Enter Room ID" class="form-field w-4/5">
                <button id="join-room-btn" class="bg-[#444] hover:bg-[#555] disabled:bg-gray-400 transition font-semibold py-2 rounded w-1/5 border border-[#555] cursor-pointer">JOIN ROOM</button>
            </div>
            <p class="text-l m-4">OR</p>
            <div class="flex justify-center">
                <button id="create-room-btn" class="form-button cursor-pointer">CREATE ROOM</button>
            </div>
        
        </div>
    </div>
    `
}

export function gameButtonsRow() {
    return `
    ${remoteGameModal()}
    <section class="grid grid-cols-3">
        <a id="local-game-btn" class="card-button mr-1.5">
            <div>
                <span>LOCAL</span>
                <svg class="mx-auto h-10" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 8h.01"/>
                    <path d="M12 12h.01"/>
                    <path d="M14 8h.01"/>
                    <path d="M16 12h.01"/>
                    <path d="M18 8h.01"/>
                    <path d="M6 8h.01"/>
                    <path d="M7 16h10"/>
                    <path d="M8 12h.01"/>
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                </svg>
            </div>
        </a>
        <a id="remote-game-btn" class="card-button text-center mx-1.5">
            <div>
                <span>REMOTE</span>
                <svg class="mx-auto h-10" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                    <path d="M2 12h20"/>
                </svg>
            </div>
        </a>
        <a id="tournament-game-btn" class="card-button text-center ml-1.5">
            <div>
                <span>TOURNAMENT</span>
                <svg class="mx-auto h-10" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/>
                    <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/>
                    <path d="M18 9h1.5a1 1 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>
                    <path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>
                </svg>
            </div>
        </a>
    </section>
    `
}
