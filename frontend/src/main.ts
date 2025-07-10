import './style.css'

import viteLogo from '/vite.svg'
import typescriptLogo from './typescript.svg'

import { loginPage } from './emailLogin.ts'

async function on_startup() {

    const params = new URLSearchParams(window.location.search)

    const uid = params.get('id')
    const username = params.get('username')
    const expires_at = params.get('expires_at')

    const has_uid = localStorage.getItem('uid');
    const has_username = localStorage.getItem('username');
    const has_expires_at = localStorage.getItem('expires_at');

    if (uid && username && expires_at && !has_uid && !has_username && !has_expires_at) {
        localStorage.setItem('uid', uid);
        localStorage.setItem('username', username);
        localStorage.setItem('expires_at', expires_at);
        localStorage.setItem('is_login', 'true');
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (has_expires_at && parseInt(has_expires_at) < Math.floor(Date.now() / 1000)) {
        localStorage.removeItem('uid');
        localStorage.removeItem('username');
        localStorage.removeItem('is_login');
        localStorage.removeItem('expires_at');
        window.location.reload();
    }

    const is_login = localStorage.getItem('is_login');

    if (is_login) {
        await mainPage();
    }

    else {
        loginPage();
    }

}

export async function mainPage() {

    let uid = localStorage.getItem('uid');
    let username = localStorage.getItem('username');

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div class="text-white bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-4">
            <a href="https://vite.dev" target="_blank">
                <img src="${viteLogo}" class="logo" alt="Vite logo" />
            </a>
            <a href="https://www.typescriptlang.org/" target="_blank">
                <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
            </a>
            <h1>Welcome ${username ? username : 'Guest'}!</h1>
            ${username ? `<p class="text-sm text-gray-400">UUID: ${uid}</p>` : ''}
            <div class="card">
                <button id="counter" type="button"></button>
            </div>
            <p class="read-the-docs">
                Click on the Vite and TypeScript logos to learn more
            </p>
            <button id="logout" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-2">${username ? 'Logout' : 'Login'}</button>
        </div>
    `;

    const loginBtn = document.getElementById('logout') as HTMLButtonElement;

    loginBtn.addEventListener('click', () => {

        if (username) {
            localStorage.removeItem('uid');
            localStorage.removeItem('username');
            localStorage.removeItem('is_login');
            localStorage.removeItem('expires_at');
            window.location.reload();
        }
        
        else {
            loginPage();
        }
        
    });

}

on_startup();
