import './style.css'

import { secureFetch } from './utils/secureFetch.ts'
import { auth_endpoint, game_endpoint, users_endpoint, websocket_endpoint } from './provider/api.ts'

import { initRouter, navigate } from './router.ts'

import { type User } from './interfaces/user.ts'
import { type WinRateData } from './interfaces/winrate.ts'

import { headerSection } from './main-components/header.ts'
import { friendsSideBar, acceptFriend, declineFriend } from './main-components/sidebar.ts'
import { gameButtonsRow, remoteGameModal } from './main-components/games_row.ts'
import { statCard } from './main-components/stat_card.ts'
import { gameLogCard } from './main-components/game_log_card.ts'
import { userCard } from './main-components/user_card.ts'

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
    
    const is_login = localStorage.getItem('is_login');
    
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if ((!has_uid || !has_expires_at) && !is_login) {
        localStorage.clear()
        await secureFetch(auth_endpoint('/logout'), { method: 'POST' });
        await navigate('/login');
    }
    
    if (has_expires_at && parseInt(has_expires_at) < Math.floor(Date.now() / 1000)) {
        localStorage.clear()
        await secureFetch(auth_endpoint('/logout'), { method: 'POST' });
        await navigate('/login');
    }

    await initRouter();
}

async function mainPageHTML(user_image: Response, user: User) {
    const winrate = await secureFetch(game_endpoint('/stats/winrate'), {
        method: 'GET'
    });

    const winrate_data = await winrate.json() as WinRateData;

    const win_count = winrate_data.wins;
    const loss_count = winrate_data.losses;

    return `

    ${headerSection(user)}
    <main class="flex">
        ${await friendsSideBar()}

        ${remoteGameModal()}
        <section class="flex-1 p-4 space-y-4">
            ${await userCard(user, user_image)}
            ${gameButtonsRow()}
            ${statCard(win_count, loss_count)}
            ${await gameLogCard()}
        </section>

    </main>
    `
}

export async function mainPage() {
    const online_wss = new WebSocket(websocket_endpoint('/user/online'));

    const userdata = await secureFetch(users_endpoint('/data'), { method: 'GET' });
    const user_image = await secureFetch(users_endpoint('/image'), { method: 'GET' });
    const user = await userdata.json() as User;

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = await mainPageHTML(user_image, user);
    
    // Settings
    // - 2FA
    const qrModal = document.getElementById('qr-modal')!;
    const manualCode = document.getElementById('manual-code') as HTMLParagraphElement;
    
    const showQrBtn = document.getElementById('show-2fa') as HTMLButtonElement;
    showQrBtn.addEventListener('click', async () => {
        try {
            const response = await secureFetch(auth_endpoint('/2fa/generate'), {
                method: 'POST'
            });
            const data = await response.json();
            const qrImg = document.getElementById('qr-image') as HTMLImageElement;
            qrImg.src = data.qr_data_url;

            manualCode.textContent = `Manual code (backup): ${data.totp_token}`;
            qrModal.classList.remove('hidden');
        }
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }
    })

    const closeQrModalBtn = document.getElementById('close-qr') as HTMLButtonElement;
    closeQrModalBtn.addEventListener('click', () => { qrModal.classList.add('hidden'); });

    const enable2fa = document.getElementById('enable-2fa') as HTMLButtonElement;
    enable2fa.addEventListener('click', async () => {
        try {
            const response = await secureFetch(auth_endpoint('/2fa/enable'), {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch QR code.');
            }
            qrModal.classList.add('hidden');
        }
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }
    })
    
    const disable2fa = document.getElementById('disable-2fa') as HTMLButtonElement;
    disable2fa.addEventListener('click', async () => {
        try {
            const response = await secureFetch(auth_endpoint('/2fa/disable'), {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch QR code.');
            }
            qrModal.classList.add('hidden');
        }
        catch (error) {
            console.error(error);
            alert('Error loading QR code.');
        }
    })

    const copyManualCodeBtn = document.getElementById('copy-code') as HTMLButtonElement;
    copyManualCodeBtn.addEventListener('click', async () => {
        const code = manualCode.textContent?.replace("Manual code (backup): ", "").trim();
        if (!code) {
            return;
        } 
        try {
            await navigator.clipboard.writeText(code);
            copyManualCodeBtn.textContent = "✅";
            setTimeout(() => copyManualCodeBtn.textContent = "📋", 1500);
        }
        catch (err) {
            alert("Failed to copy");
            console.error(err);
        }
    });

    // - Change profile pic
    const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
    uploadBtn.addEventListener('click', () => uploadInput.click());
    
    const uploadInput = document.getElementById('upload-input') as HTMLInputElement;
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
            const profileImg = document.getElementById('profile-img') as HTMLImageElement;
            profileImg.src = newUri;
        }
        catch (err) {
            alert("Failed to upload image.");
            console.error(err);
        }
    });

    // - Logout
    const logoutBtn = document.getElementById('logout') as HTMLButtonElement;
    logoutBtn.addEventListener('click', async () => {
        online_wss.close();
        localStorage.clear()

        await secureFetch(auth_endpoint('/logout'), { method: 'POST' });
        await navigate('/login');
    });

    // Friends sidebar
    // - Friends
    const friendsContainer = document.getElementById('friends-container')!;
    friendsContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        // if click username, go to friend's page
        const usernameEl = target.closest('.friend-username') as HTMLElement | null;
        if (usernameEl) {
            console.log(usernameEl);
            const uid = usernameEl.dataset.uid!;
            window.location.href = `/profile/${uid}`;
            return ;
        }

        // if click 'unfriend' button, unfriend
        const unfriendBtn = target.closest('.btn-unfriend') as HTMLButtonElement | null;
        if (!unfriendBtn)
            return ;

        const uid = unfriendBtn.dataset.uid!;
        const row = unfriendBtn.closest('.friends-row-item') as HTMLDivElement;
        unfriendBtn.disabled = true;

        try {
            const res = await secureFetch(users_endpoint(`/friends/${uid}`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Unfriend failed');
    
            row.remove();
        } catch (err) {
            alert((err as Error).message);
            unfriendBtn.disabled = false;
        }
    });

    const addFriendModal = document.getElementById('add-friend-modal')!;
    const openAddFriendModalBtn = document.getElementById('open-add-friend-btn') as HTMLDivElement;
    const closeAddFriendModalBtn = document.getElementById('close-add-friend-btn') as HTMLButtonElement;
    openAddFriendModalBtn.addEventListener('click', async () => { addFriendModal.classList.remove('hidden'); });
    closeAddFriendModalBtn.addEventListener('click', async () => { addFriendModal.classList.add('hidden'); });

    // - Requests
    const requestsContainer = document.getElementById('pending-requests')!;
    requestsContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        // find the clicked button
        const acceptBtn = target.closest('.btn-accept') as HTMLButtonElement | null;
        const declineBtn = target.closest('.btn-decline') as HTMLButtonElement | null;

        if (!acceptBtn && !declineBtn) return;

        const uid = (acceptBtn ?? declineBtn)!.dataset.uid!;
        const row = (acceptBtn ?? declineBtn)!.closest('.friends-row-item') as HTMLDivElement;

        // optimistic UI: disable buttons
        (row.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).forEach(b => b.disabled = true);

        try {
            if (acceptBtn) {
                await acceptFriend(uid);
                row.outerHTML = `<div class="friends-row-item">${row.querySelector('span')!.textContent} ✓</div>`;
            } else {
                await declineFriend(uid);
                row.remove();
            }
        } catch (err) {
            alert('Action failed. Please try again.');
            (row.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).forEach(b => b.disabled = false);
        }
    });

    const addFriendBtn = document.getElementById('add-friend-btn') as HTMLInputElement;
    addFriendBtn.addEventListener('click', async () => {
        const addFriendField = document.getElementById('add-friend-field') as HTMLInputElement;
        const uid = addFriendField.value;
        if (!uid) {
            return ;
        }
        const res = await secureFetch(users_endpoint(`/friends/${uid}`), {
            "method": "POST"
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || "Something went wrong");
            return ;
        }

        alert(data.message);
    });

    // Games row
    // - Local
    const localGameBtn = document.getElementById('local-game-btn') as HTMLAnchorElement;
    localGameBtn.addEventListener('click', async () => { await navigate('/local-game'); });
    
    // - Remote
    const remoteGameBtn = document.getElementById('remote-game-btn') as HTMLAnchorElement;
    const remoteModal = document.getElementById('remote-modal')!;
    const closeRemoteModalBtn = document.getElementById('close-remote') as HTMLButtonElement;
    remoteGameBtn.addEventListener('click', async () => { remoteModal.classList.remove('hidden'); })
    closeRemoteModalBtn.addEventListener('click', () => { remoteModal.classList.add('hidden'); });
    
    const createRoomBtn = document.getElementById('create-room-btn') as HTMLButtonElement;
    createRoomBtn.addEventListener('click', async () => {
        const response = await secureFetch(game_endpoint('/room/create'), { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to create new room.');
        }
        const data = await response.json();
        await navigate(`/remote-game?gid=${data.gid}`);
    });
    
    const joinRoomBtn = document.getElementById('join-room-btn') as HTMLButtonElement;
    joinRoomBtn.addEventListener('click', async () => {
        const roomField = document.getElementById('room-field') as HTMLInputElement;
        const gid = roomField.value;
        if (!gid) {
            return;
        }
        await navigate(`/remote-game?gid=${gid}`);
    });

    // - Tournament
    const tournamentGameBtn = document.getElementById('tournament-game-btn') as HTMLAnchorElement;
    tournamentGameBtn.addEventListener('click', async () => {
        localStorage.removeItem("matches");
        localStorage.removeItem("players");
        await navigate('/tournament-setup');
    });
}

on_startup();
