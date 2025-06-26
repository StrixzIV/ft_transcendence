import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import { loginPage } from './emailLogin.ts'

export function mainPage() {
    
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div>

            <a href="https://vite.dev" target="_blank">
            <img src="${viteLogo}" class="logo" alt="Vite logo" />
            </a>
            <a href="https://www.typescriptlang.org/" target="_blank">
            <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
            </a>
            <h1>Vite + TypeScript</h1>
            <div class="card">
            <button id="counter" type="button"></button>
            </div>
            <p class="read-the-docs">
            Click on the Vite and TypeScript logos to learn more
            </p>

            <button id="logout" class="hover:bg-red-400 mt-1">Login</button>


        </div>
    `

    const loginBtn = document.getElementById('logout') as HTMLButtonElement;

    loginBtn.addEventListener('click', () => {
        localStorage.removeItem('is_login')
        window.location.reload();
    })

    setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

}

if (localStorage.getItem('is_login') === 'true') {
    mainPage();
}

else {
    loginPage();
}
