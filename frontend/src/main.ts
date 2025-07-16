import './style.css'

import viteLogo from '/vite.svg'
import typescriptLogo from './typescript.svg'

import { loginPage } from './emailLogin.ts'
import { auth_endpoint } from './provider/api.ts'
import { twoFactorPage } from './2fa.ts'

async function on_startup() {

    const params = new URLSearchParams(window.location.search)

    const uid = params.get('id')
    const username = params.get('username')
    const expires_at = params.get('expires_at')
    const twofa = params.get('twofa')

    const has_uid = localStorage.getItem('uid');
    const has_username = localStorage.getItem('username');
    const has_expires_at = localStorage.getItem('expires_at');

    if (uid && username && expires_at && !has_uid && !has_username && !has_expires_at) {
        localStorage.setItem('uid', uid);
        localStorage.setItem('username', username);
        localStorage.setItem('expires_at', expires_at);
        localStorage.setItem('is_login', 'true');
    }

    if (uid && twofa && twofa === 'true') {
        localStorage.setItem('uid', uid);
        window.history.replaceState({}, document.title, window.location.pathname);
        twoFactorPage();
        return ;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (has_expires_at && parseInt(has_expires_at) < Math.floor(Date.now() / 1000)) {
        
        localStorage.removeItem('uid');
        localStorage.removeItem('username');
        localStorage.removeItem('is_login');
        localStorage.removeItem('expires_at');
        
        await fetch(auth_endpoint('/logout'), {
            method: 'POST',
            credentials: 'include'
        });
    
        window.location.reload();
    
    }

    const is_login = localStorage.getItem('is_login');

    if (is_login) {
        await mainPage();
    }

    else {

        await fetch(auth_endpoint('/logout'), {
            method: 'POST',
            credentials: 'include'
        });

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

            <button id="show-2fa" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">Enable 2FA</button>
            <button id="logout" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-2">Logout</button>

        </div>
    
        <div id="qr-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded shadow-md text-black relative">
                
                <button id="close-qr" class="absolute top-2 right-2 text-xl">&times;</button>
                <h2 class="text-lg mb-4">Scan this QR Code</h2>
                
                <div class="flex justify-center">
                    <img id="qr-image" src="" alt="2FA QR Code" class="w-48 h-48"/>
                </div>
                
                <div class="mt-4 flex items-center space-x-2">
                    <p id="manual-code" class="text-sm mt-4 break-all"></p>
                    <button id="copy-code" class="text-xs mt-4 px-2 py-1 bg-gray-400 hover:bg-gray-300 text-black rounded">📋</button>
                </div>
                
                <button id="disable-2fa" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded mt-2">Disable 2FA</button>
            
            </div>
        </div>
    
    `;

    const loginBtn = document.getElementById('logout') as HTMLButtonElement;

    const showQrBtn = document.getElementById('show-2fa') as HTMLButtonElement;
    const modal = document.getElementById('qr-modal')!;
    const closeModalBtn = document.getElementById('close-qr') as HTMLButtonElement;
    const qrImg = document.getElementById('qr-image') as HTMLImageElement;
    const manualCode = document.getElementById('manual-code') as HTMLParagraphElement;
    const disable2fa = document.getElementById('disable-2fa') as HTMLButtonElement;
    const copyBtn = document.getElementById('copy-code') as HTMLButtonElement;
    
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

    showQrBtn.addEventListener('click', async () => {

        try {

            const response = await fetch(auth_endpoint('/2fa/enable'), {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {

                if (response.status == 401 || response.status == 403) {

                    await fetch(auth_endpoint('/logout'), {
                        method: 'POST',
                        credentials: 'include'
                    });

                    localStorage.removeItem('uid');
                    localStorage.removeItem('username');
                    localStorage.removeItem('is_login');
                    localStorage.removeItem('expires_at');
                    window.location.reload();
            
                    loginPage();
                    return ;
                    
                }

                throw new Error('Failed to fetch QR code.');
            
            }

            const data = await response.json();
            qrImg.src = data.qr_data_url;
            manualCode.textContent = `Manual code (backup): ${data.base32}`;
            modal.classList.remove('hidden');
        }
        
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }

    })
    
    disable2fa.addEventListener('click', async () => {

        try {

            const response = await fetch(auth_endpoint('/2fa/disable'), {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch QR code.');
            }

            modal.classList.add('hidden');

        }
        
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }

    })

    copyBtn.addEventListener('click', async () => {

        const code = manualCode.textContent?.replace("Manual code (backup): ", "").trim();
        
        if (!code) {
            return;
        } 

        try {
            await navigator.clipboard.writeText(code);
            copyBtn.textContent = "✅";
            setTimeout(() => copyBtn.textContent = "📋", 1500);
        }
        
        catch (err) {
            alert("Failed to copy");
            console.error(err);
        }

    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

}

on_startup();
