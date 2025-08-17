import { type User } from '../interfaces/user.ts'

export async function userCard(user: User, user_image: Response) {
    const blob = await user_image.blob()
    const image_uri = URL.createObjectURL(blob)
    return `
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
    `
}
