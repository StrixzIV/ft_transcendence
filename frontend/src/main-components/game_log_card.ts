import { secureFetch } from '../utils/secureFetch.ts'
import { game_endpoint, users_endpoint } from '../provider/api.ts'

import { type User } from '../interfaces/user.ts'
import { type Match } from '../interfaces/match.ts'

export async function gameLogCard() {

    const history = await secureFetch(game_endpoint('/stats/history'), {
        method: 'GET'
    });

    const match_data = await history.json() as Array<Match>;

    let gameLogItems = '';

    for (const match_item of match_data) {

        const isWinner = match_item.uid === match_item.match.winner_id;
        const resultClass = isWinner ? 'text-green' : 'text-red';
        const resultText = isWinner ? 'WIN' : 'LOSS';
        const score = `${match_item.match.left_score}-${match_item.match.right_score}`;

        const leftPlayer = match_item.match.players.find(player => player.side === 'leftPlayer')!;
        const rightPlayer = match_item.match.players.find(player => player.side === 'rightPlayer')!;

        const leftOpponent = await secureFetch(users_endpoint(`/data/${leftPlayer?.uid}`), {
            method: 'GET'
        });

        const rightOpponent = await secureFetch(users_endpoint(`/data/${rightPlayer?.uid}`), {
            method: 'GET'
        });

        const leftOpponentData = await leftOpponent.json() as User;
        const rightOpponentData = await rightOpponent.json() as User;

        gameLogItems += `
            <div class="game-log-row-item">
            <span>${leftOpponentData.username} vs ${rightOpponentData.username}</span>
            <span class="${resultClass}">${resultText}</span>
            <span>${score}</span>
            </div>
        `;

    }

    return `
      <section class="card">
        <header class="card-title">> GAME LOG</header>
        <div class="dividers-2">
          ${gameLogItems}
        </div>
      </section>
    `;
}
