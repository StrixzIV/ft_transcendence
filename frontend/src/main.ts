import './style.css'

import { jwtDecode } from 'jwt-decode';

import viteLogo from '/vite.svg'
import typescriptLogo from './typescript.svg'

import { loginPage } from './emailLogin.ts'
import { type JWTMetadata } from './interfaces/jwt.ts'

function on_startup() {

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
        localStorage.setItem('jwt_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        mainPage();
    }

    else if (localStorage.getItem('jwt_token') != null) {
        mainPage();
    }

    else {
        loginPage();
    }

}

export function mainPage() {

    const token = localStorage.getItem('jwt_token');

    let username = '';
    let uid = '';

    if (token) {

        try {

            const decoded = jwtDecode<JWTMetadata>(token);

            if (decoded.exp < Math.floor(Date.now() / 1000)) {
                localStorage.removeItem('jwt_token');
                window.location.reload();
                return
            }

            username = decoded.username;
            uid = decoded.id;
        
        }
        
        catch (err) {
            console.error('Invalid token:', err);
        }

    }

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
            localStorage.removeItem('jwt_token');
            window.location.reload();
        }
        
        else {
            loginPage();
        }
        
    });

}

on_startup();
