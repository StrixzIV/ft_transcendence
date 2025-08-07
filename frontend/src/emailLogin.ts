import { twoFactorPage } from "./2fa";
import { auth_endpoint } from "./provider/api";
import { registerPage } from "./register";

export function loginPage() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

        <div class="form">
            
            <h1 class="text-large">LOGIN</h1>
            <form id="login-form" class="space-y-4">
                <input type="text" id="username" class="form-field" placeholder="Username"/>
                <input type="password" id="password" class="form-field" placeholder="Password"/>
                <button type="submit" class="form-button">Login</button>
            </form>
            
            <p class="font-bold">OR</p>

            <button id="google-login" class="form-button-red">Login with Google</button>
            <button id="register" class="form-button">Register</button>
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
