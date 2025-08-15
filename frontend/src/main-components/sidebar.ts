import { secureFetch } from '../utils/secureFetch.ts'
import { users_endpoint } from '../provider/api.ts'

import { type User } from '../interfaces/user.ts'

function addFriendModal() {
    return `
    <div id="add-friend-modal" class="hidden fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
        <div class="bg-[#1a1a1a] p-6 rounded shadow-md text-white relative border border-[#444] w-4xl">
            
            <button id="close-add-friend-btn" class="absolute top-2 right-2 text-xl">&times;</button>
            <h2 class="text-2xl mb-4 font-semibold">ADD FRIEND</h2>

            <div class="flex gap-4">
                <input type="text" id="add-friend-field" placeholder="Enter Friend's UID" class="form-field w-4/5">
                <button id="add-friend-btn" class="bg-[#444] hover:bg-[#555] disabled:bg-gray-400 transition font-semibold py-2 rounded w-1/5 border border-[#555] cursor-pointer">REQUEST</button>
            </div>   
        </div>
    </div>
    `
}

async function getFriendsItems() {

    let res = await secureFetch(users_endpoint('/friends'), { method: 'GET' });
    let data = await res.json() as { friends: Array<User>, error?: string };
  
    if (!res.ok) {
        alert(data.error || "Something went wrong");
        return '';
    }
  
    const friends = data.friends;
    let friend_items = '';
  
    for (const friend of friends) {

      friend_items += `
        <div class="friends-row-item flex items-center justify-between" data-uid="${friend.id}">
            <span class="truncate">${ friend.status == "ONLINE" ? "<span class=\"online-dot-friend\"></span>" : ""} ${friend.username}</span>
            <div class="flex gap-2">
                <button class="btn-unfriend form-button-base !px-1 !py-1 bg-[#444] hover:bg-[#555] rounded cursor-pointer" data-uid="${friend.id}">
                    <!-- minus sign -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"/>
                    </svg>
                </button>
            </div>
        </div>
      `;

    }
  
    return friend_items;
}  

async function pendingRequestItems() {
    const res = await secureFetch(users_endpoint('/friends/requests'), { method: 'GET' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return '';
    }
  
    const requests: Array<User> = data.requests ?? [];
  
    // fetch usernames in parallel
    const rows = await Promise.all(requests.map(async (r) => {
      const ures = await secureFetch(users_endpoint(`/data/${r.id}`));
      const user = await ures.json();
      const username = user.username ?? r.id;
      // each row has accept/decline buttons with the uid in data-uid
      return `
        <div class="friends-row-item flex items-center justify-between gap-2" data-uid="${r.id}">
            <span class="truncate">${username}</span>
            <div class="flex gap-2">
                <button class="btn-accept form-button-base !px-1 !py-1 bg-green-800 hover:bg-green-700 rounded cursor-pointer" data-uid="${r.id}">
                    <!-- tick sign -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>
                </button>
                <button class="btn-decline form-button-base !px-1 !py-1 bg-red-800 hover:bg-red-700 rounded cursor-pointer" data-uid="${r.id}">
                    <!-- cross sign -->    
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
        </div>`;
    }));
  
    return rows.join('');
}

export async function friendsSideBar() {
    return `
    ${addFriendModal()}
    <aside class="sidebar">
        <h2 class="card-title">
            > FRIENDS
        </h2>

        <div class="dividers-2" id="friends-container">
            ${await getFriendsItems()}
        </div>

        <div id="open-add-friend-btn" class="flex gap-2 items-center justify-center card-button mt-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
            </svg>
            <span class="mr-2">ADD FRIEND</span>
        </div>

        <h2 class="card-title mt-4">
            > REQUESTS
        </h2>

        <div class="dividers-2" id="pending-requests">
            ${await pendingRequestItems()}
        </div>
    </aside>
    `;
}

export async function acceptFriend(uid: string) {
    const res = await secureFetch(users_endpoint(`/friends/${uid}/accept`), { method: 'PUT' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Accept failed');
    window.location.reload();
    return data;
}

export async function declineFriend(uid: string) {
    const res = await secureFetch(users_endpoint(`/friends/${uid}/deny`), { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Decline failed');
    window.location.reload();
    return data;
}
