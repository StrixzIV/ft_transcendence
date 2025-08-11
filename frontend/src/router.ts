import { twoFactorPage } from "./2fa";
import { loginPage } from "./emailLogin";
import { loadLocalGame } from "./local-game/local_game";
import { mainPage } from "./main";
import { registerPage } from "./register";
import { loadTournamentGame } from "./tournament/tournament_game";
import { tournamentSetupPage } from "./tournament/tournament_init";
import { tournamentMainPage } from "./tournament/tournament_main";

type RouteHandler = () => Promise<void> | void;

// Config your route with the rendering function here
const routes: Record<string, RouteHandler> = {
    "/": mainPage,
    "/login": loginPage,
    "/2fa": twoFactorPage,
    "/register": registerPage,
    "/local-game": loadLocalGame,
    "/tournament-setup": tournamentSetupPage,
    "/tournament": tournamentMainPage,
    "/tournament-game": loadTournamentGame
};

export async function initRouter() {
    window.addEventListener("popstate", renderRoute);
    await renderRoute();
}

export async function renderRoute() {
    const path = window.location.pathname;
    const route = routes[path] || routes["/login"];
    await route();
}

export async function navigate(path: string) {
    history.pushState({}, "", path);
    await renderRoute();
}
