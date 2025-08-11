import './style.css'

import { secureFetch } from './utils/secureFetch.ts'
import { auth_endpoint, users_endpoint } from './provider/api.ts'

import { initRouter, navigate } from './router.ts'

async function on_startup() {

    const params = new URLSearchParams(window.location.search)

    const uid = params.get('id')
    const expires_at = params.get('expires_at')
    const twofa = params.get('twofa')

    const has_uid = localStorage.getItem('uid');
    const has_expires_at = localStorage.getItem('expires_at');

    if (uid && expires_at && !has_uid && !has_expires_at) {
        localStorage.setItem('uid', uid);
        localStorage.setItem('expires_at', expires_at);
        localStorage.setItem('is_login', 'true');
    }

    if (uid && twofa && twofa === 'true') {
        localStorage.setItem('uid', uid);
        window.history.replaceState({}, document.title, window.location.pathname);
        await navigate('/2fa');
        return ;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (has_expires_at && parseInt(has_expires_at) < Math.floor(Date.now() / 1000)) {

        localStorage.removeItem('uid');
        localStorage.removeItem('is_login');
        localStorage.removeItem('expires_at');
        
        await fetch(auth_endpoint('/logout'), {
            method: 'POST',
            credentials: 'include'
        });

        await navigate('/login');
    
    }

    await initRouter();

}

export async function mainPage() {

    const userdata = await secureFetch(users_endpoint('/data'), {
        method: 'GET'
    });

    const user_image = await secureFetch(users_endpoint('/image'), {
        method: 'GET'
    });

    const user = await userdata.json()
    const blob = await user_image.blob()
    const image_uri = URL.createObjectURL(blob)

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    
    <!-- Header-->
    <div class="header">
        <!-- Site name -->
        <header class="tracking-widest text-xl">FT_TRANSCENDENCE</header>

        <!-- Right side -->
        <div class="flex gap-4">
            <!-- Login name, dropdown menu -->
             <div class="relative group inline-block p-1">
                <span class="cursor-pointer">${user.username ? user.username : 'Guest'} ▾</span>

                <!-- Dropdown menu -->
                <div class="dropdown">
                    <p id="show-2fa" class="cursor-pointer block p-2 hover:bg-[#444]">Enable 2FA</p>
                    <p id="upload-btn" class="cursor-pointer block p-2 hover:bg-[#444]">Update Profile</p>
                    <p id="logout" class="cursor-pointer block p-2 hover:bg-[#444] text-red">Log out</p>

                    <input 
                        type="file" 
                        id="upload-input" 
                        accept="image/*" 
                        class="hidden"
                    />

                    <div id="qr-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
                        <div class="bg-[#1a1a1a] p-6 rounded shadow-md text-white relative border border-[#444]">
                            
                            <button id="close-qr" class="absolute top-2 right-2 text-xl">&times;</button>
                            <h2 class="text-lg mb-4">Scan this QR Code</h2>
                            
                            <div class="flex justify-center">
                                <img id="qr-image" src="" alt="2FA QR Code" class="w-48 h-48"/>
                            </div>
                            
                            <div class="mt-4 flex items-center space-x-2">
                                <p id="manual-code" class="text-sm mt-4 break-all"></p>
                                <button id="copy-code" class="text-xs mt-4 px-2 py-1 border border-[#444] bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded">📋</button>
                            </div>
                            
                            <button id="enable-2fa" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mt-2">Enable 2FA</button>
                            <button id="disable-2fa" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded mt-2">Disable 2FA</button>
                        
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <main class="flex">
        <!-- FRIEND Sidebar -->
        <aside class="sidebar">
            <header class="card-title">> FRIENDS</header>

            <div class="dividers-2">
                <div class="friends-row-item"><span>opponent_minirt</span></div>
                <div class="friends-row-item"><span>opponent_minishell</span></div>
                <div class="friends-row-item"><span>opponent_fractol</span></div>
                <div class="friends-row-item"><span>opponent_get-next-line</span></div>
                <div class="friends-row-item"><span>opponent_libft</span></div>
            </div>

            <div class="flex gap-2 items-center justify-center card-button mt-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                </svg>
                <span class="mr-2">ADD FRIEND</span>
            </div>
        </aside>

        <!-- Main Area -->
        <section class="flex-1 p-4 space-y-4">
            <section class="card space-y-4">
                <header class="card-title">> USER</header>
    
                <div class="flex gap-3">
                    <!-- Picture -->
                    <div class="relative inline-block w-32 h-32 flex-shrink-0">
                        <img id="profile-img" class="image" src="${image_uri}" alt="User avatar">
                        <span class="online-dot"></span>
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-1 space-y-2">
                        <div class="card-field">
                            <p class="text-gray">USERNAME</p>
                            <p>${user.username ? user.username : 'Guest'}</p>
                        </div>
                        
                        <div class="card-field">
                            <p class="text-gray">UID</p>
                            <p>${user.username ? `<p>${user.id}</p>` : ''}</p>
                        </div>
                    </div>

                </div>
            </section>

            <!-- Play games button row -->
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
                <a href="#" class="card-button text-center mx-1.5">
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

            <!-- STAT Card -->
            <section class="card">
                <header class="card-title">> STATS</header>

                <div class="dividers-2">
                    <div class="row-item-indent">
                        <span>WIN</span>
                        <span>42</span>
                    </div>
                    <div class="row-item-indent">
                        <span>LOSS</span>
                        <span>8</span>
                    </div>
                    <div class="row-item-indent">
                        <span>WIN RATE</span>
                        <span>84%</span>
                    </div>
                </div>
            </section>

            <!-- GAME LOG Card -->
            <section class="card">
                <header class="card-title">> GAME LOG</header>
    
                <div class="dividers-2">
                    <div class="game-log-row-item">
                        <span>opponent_minirt</span>
                        <span class="text-green">WIN</span>
                    </div>
                    <div class="game-log-row-item">
                        <span>opponent_minishell</span>
                        <span class="text-red">LOSS</span>
                    </div>
                    <div class="game-log-row-item">
                        <span>opponent_fractol</span>
                        <span class="text-green">WIN</span>
                    </div>
                    <div class="game-log-row-item">
                        <span>opponent_get-next-line</span>
                        <span class="text-red">LOSS</span>
                    </div>
                    <div class="game-log-row-item">
                        <span>opponent_libft</span>
                        <span class="text-green">WIN</span>
                    </div>
                </div>
            </section>
        </section>

    </main>
    `;

    const loginBtn = document.getElementById('logout') as HTMLButtonElement;

    const showQrBtn = document.getElementById('show-2fa') as HTMLButtonElement;
    const modal = document.getElementById('qr-modal')!;
    const closeModalBtn = document.getElementById('close-qr') as HTMLButtonElement;
    const qrImg = document.getElementById('qr-image') as HTMLImageElement;
    const manualCode = document.getElementById('manual-code') as HTMLParagraphElement;
    const enable2fa = document.getElementById('enable-2fa') as HTMLButtonElement;
    const disable2fa = document.getElementById('disable-2fa') as HTMLButtonElement;
    const copyBtn = document.getElementById('copy-code') as HTMLButtonElement;

    const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
    const uploadInput = document.getElementById('upload-input') as HTMLInputElement;
    const profileImg = document.getElementById('profile-img') as HTMLImageElement;

    const localGameBtn = document.getElementById('local-game-btn') as HTMLAnchorElement;
    const tournamentGameBtn = document.getElementById('tournament-game-btn') as HTMLAnchorElement;
    
    localGameBtn.addEventListener('click', async () => {
        await navigate('/local-game');
    });

    tournamentGameBtn.addEventListener('click', async () => {
        await navigate('/tournament-setup');
    });

    loginBtn.addEventListener('click', async () => {

        if (user.username) {
            localStorage.removeItem('uid');
            localStorage.removeItem('username');
            localStorage.removeItem('is_login');
            localStorage.removeItem('expires_at');
            window.location.reload();
        }
        
        else {
            await navigate('/login');
        }
        
    });

    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', async () => {

        if (!uploadInput.files || uploadInput.files.length === 0) return;

        const file = uploadInput.files[0];

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be smaller than 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {

            const res = await secureFetch(users_endpoint('/image'), {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const newBlob = await secureFetch(users_endpoint('/image')).then(r => r.blob());
            const newUri = URL.createObjectURL(newBlob);
            profileImg.src = newUri;

        }
        
        catch (err) {
            alert("Failed to upload image.");
            console.error(err);
        }

    });

    showQrBtn.addEventListener('click', async () => {

        try {

            const response = await secureFetch(auth_endpoint('/2fa/generate'), {
                method: 'POST'
            });

            if (!response.ok) {

                if (response.status == 401 || response.status == 403) {

                    await secureFetch(auth_endpoint('/logout'), {
                        method: 'POST'
                    });

                    localStorage.removeItem('uid');
                    localStorage.removeItem('username');
                    localStorage.removeItem('is_login');
                    localStorage.removeItem('expires_at');
            
                    await navigate('/login');
                    return ;
                    
                }

                throw new Error('Failed to fetch QR code.');
            
            }

            const data = await response.json();
            qrImg.src = data.qr_data_url;
            manualCode.textContent = `Manual code (backup): ${data.totp_token}`;
            modal.classList.remove('hidden');
        }
        
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }

    })

    enable2fa.addEventListener('click', async () => {

        try {

            const response = await secureFetch(auth_endpoint('/2fa/enable'), {
                method: 'POST'
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
    
    disable2fa.addEventListener('click', async () => {

        try {

            const response = await secureFetch(auth_endpoint('/2fa/disable'), {
                method: 'POST'
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
