function gamesCount(win_count: number, loss_count: number) {
    return win_count + loss_count;
}

function winPercent(win_count: number, loss_count: number) {
    const games_count = gamesCount(win_count, loss_count);
    if (games_count == 0)
            return 0;
    return Math.round((win_count / games_count) * 100 * 100) / 100;
}

function winLossBarGraph(win_count: number, loss_count: number) {
    const games_count = gamesCount(win_count, loss_count);
    if (games_count == 0) {
        return `
        <div class="flex mx-auto mt-4 w-11/12 h-6 overflow-hidden bg-[#444] rounded-sm items-center justify-center text-xs font-bold text-white">0</div>
        `;
    }

    const win_percent = winPercent(win_count, loss_count);
    return `
    <div class="flex mx-auto mt-4 h-6 overflow-hidden">
        <div class="flex items-center justify-center text-xs font-bold bg-green-700 rounded-sm" style="width: ${win_percent}%;">${(win_count > 0) ? win_count : ""}</div>
        <div class="flex items-center justify-center text-xs font-bold bg-red-700 rounded-sm" style="width: ${100 - win_percent}%;">${(loss_count > 0) ? loss_count : ""}</div>
    </div>
    `
}

export function statCard(win_count: number, loss_count: number) {
    return `
    <section class="card">
        <header class="card-title">> STATS</header>

        <div class="dividers-2">
            <div class="row-item-indent">
                <span>GAMES PLAYED</span>
                <span>${gamesCount(win_count, loss_count)}</span>
            </div>
            <div class="row-item-indent">
                <span>WIN</span>
                <span>${win_count}</span>
            </div>
            <div class="row-item-indent">
                <span>LOSS</span>
                <span>${loss_count}</span>
            </div>
            <div class="row-item-indent">
                <span>WIN RATE</span>
                <span>${winPercent(win_count, loss_count)}%</span>
            </div>

            ${winLossBarGraph(win_count, loss_count)}
        </div>
    </section>
    `
}
