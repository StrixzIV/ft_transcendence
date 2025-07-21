import { twoFactorPage } from "./2fa";
import { auth_endpoint } from "./provider/api";
import { registerPage } from "./register";

export function loginPage() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

      <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">

        <form id="login-form" class="bg-gray-800 p-8 rounded shadow-md space-y-4 w-80">

          <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>

          <input type="text" id="username" placeholder="Username" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          <input type="password" id="password" placeholder="Password" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          
          <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">Login</button>
          
          <div class="text-center my-2">or</div>
          <button id="google-login" type="button" class="w-full bg-red-500 hover:bg-red-600 p-2 rounded">Login with Google</button>
          <button id="register" type="button" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">Register</button>

        </form>

      </div>
    `;

    // Handle email login
    const form = document.getElementById('login-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {

        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        const response = await fetch(auth_endpoint('/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Login failed: ${errorText}`);
            return;
        }
        
        if (response.status == 202) {

            const json = await response.json();
            localStorage.setItem('uid', json.uid);

            twoFactorPage();
            return;

        }

        const json = await response.json();

        console.log(json.user.id);
        localStorage.setItem('is_login', 'true');
        localStorage.setItem('uid', json.user.id);
        localStorage.setItem('username', json.user.username);
        localStorage.setItem('expires_at', json.expires_at);

        window.location.reload();

    });

    const registerBtn = document.getElementById('register') as HTMLButtonElement;

    registerBtn.addEventListener('click', () => {
        registerPage();
    })

    // Handle Google login
    const googleBtn = document.getElementById('google-login') as HTMLButtonElement;

    googleBtn.addEventListener('click', () => {
        window.location.href = auth_endpoint('/google')
    });

}
