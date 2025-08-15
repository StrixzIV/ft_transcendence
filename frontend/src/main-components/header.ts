import { type User } from '../interfaces/user.ts'

function QrModal() {
    return `
    <div id="qr-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
        <div class="bg-[#1a1a1a] p-6 rounded shadow-md text-white relative border border-[#444]">
            
            <button id="close-qr" class="absolute top-2 right-2 text-xl">&times;</button>
            <h2 class="text-2xl font-semibold mb-2">2FA SETUP</h2>
            <p class="text-lg mb-4">Scan this QR Code to enable 2FA</p>
            
            <div class="flex justify-center">
                <img id="qr-image" src="" alt="2FA QR Code" class="w-48 h-48"/>
            </div>
            
            <div class="mt-4 mb-2 flex items-center space-x-2">
                <p id="manual-code" class="text-sm break-all"></p>
                <button id="copy-code" class="text-xs px-2 py-1 border border-[#444] bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded">📋</button>
            </div>
            
            <button id="enable-2fa" class="font-semibold py-2 px-4 rounded transition bg-green-700 hover:bg-green-600 mt-2 mr-2 cursor-pointer">Enable 2FA</button>
            <button id="disable-2fa" class="font-semibold py-2 px-4 rounded transition bg-red-700 hover:bg-red-600 mt-2 ml-2 cursor-pointer">Disable 2FA</button>
        
        </div>
    </div>
    `
}

function uploadProfilePictureInput() {
    return '<input type="file" id="upload-input"  accept="image/*" class="hidden"/>'
}

function renameModal() {
    return `
    <div id="rename-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
        <div class="bg-[#1a1a1a] p-6 rounded shadow-md text-white relative border border-[#444] w-4xl">
            
            <button id="close-rename-modal-btn" class="absolute top-2 right-2 text-xl">&times;</button>
            <h2 class="text-2xl mb-4 font-semibold">RENAME</h2>

            <div class="flex gap-4">
                <input type="text" id="rename-field" placeholder="Enter new name" class="form-field w-4/5">
                <button id="rename-btn" class="bg-[#444] hover:bg-[#555] transition font-semibold py-2 rounded w-1/5 border border-[#555] cursor-pointer">RENAME</button>
            </div>   
        </div>
    </div>
    `
}

function rightMenu(user: User) {
    return `
    <div>
    
        <div class="flex gap-4">
            <div class="relative group inline-block p-1">
                <span class="cursor-pointer">${user.username ? user.username : 'Guest'} ▾</span>

                <div class="dropdown">
                    <p id="show-2fa"   class="cursor-pointer block p-2 hover:bg-[#444]">Enable 2FA</p>
                    <p id="open-rename-modal-btn" class="cursor-pointer block p-2 hover:bg-[#444]">Rename</p>
                    <p id="upload-btn" class="cursor-pointer block p-2 hover:bg-[#444]">Change Profile Pic</p>
                    <p id="logout"     class="cursor-pointer block p-2 hover:bg-[#444] text-red">Log out</p>
                    ${uploadProfilePictureInput()}
                </div>
        
            </div>
        </div>

        ${renameModal()}
        ${QrModal()}

    </div>    
    `
}

export function headerSection(user: User) {
    return `
    <div class="header">
        <header class="tracking-widest text-xl font-bold">FT_TRANSCENDENCE</header>
        ${rightMenu(user)}
    </div>
    `
}
