import { secureFetch } from '../utils/secureFetch.ts'
import { game_endpoint, users_endpoint } from '../provider/api.ts'

import { type User } from '../interfaces/user.ts'
import { type Match } from '../interfaces/match.ts'

export async function gameLogCard() {
    const history = await secureFetch(game_endpoint('/stats/history'), { method: 'GET' });
    const match_data = await history.json() as Array<Match>;

    let gameLogItems = '';

    for (const match_item of match_data) {
        const leftPlayer = match_item.match.players.find(player => player.side === 'leftPlayer')!;
        const leftPlayerRes = await secureFetch(users_endpoint(`/data/${leftPlayer?.uid}`), { method: 'GET' });
        const leftPlayerData = await leftPlayerRes.json() as User;

        const rightPlayer = match_item.match.players.find(player => player.side === 'rightPlayer')!;
        const rightPlayerRes = await secureFetch(users_endpoint(`/data/${rightPlayer?.uid}`), { method: 'GET' });
        const rightPlayerData = await rightPlayerRes.json() as User;

        const isWinner = match_item.uid === match_item.match.winner_id;
        const resultTextColor = isWinner ? 'text-green' : 'text-red';
        const resultText = isWinner ? 'WIN' : 'LOSS';
        const resultScores = `${match_item.match.left_score} - ${match_item.match.right_score}`;
        gameLogItems += `
            <div class="game-log-row">
              <span class="game-log-row-left">${leftPlayerData.username} vs ${rightPlayerData.username}</span>
              <span class="game-log-row-middle ${resultTextColor}">${resultText}</span>
              <span class="game-log-row-right">${resultScores}</span>
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
