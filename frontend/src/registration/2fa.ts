import { navigate } from "../router";
import { auth_endpoint } from "../provider/api";

export function twoFactorPage() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

    <form id="2fa-form" class="form">

        <h2 class="text-large text-center">TWO-FACTOR AUTHENTICATION</h2>

        <p class="text-center">Enter the 6-digit code from your<br><b>Google Authenticator</b> app</p>

        <input
        type="text"
        id="token"
        maxlength="6"
        pattern="\\d{6}"
        placeholder="123456"
        required
        class="form-field text-center tracking-widest text-xl"
        />

        <button type="submit" class="form-button">
        Verify Token
        </button>

        <div id="2fa-error" class="text-red text-sm text-center hidden"></div>

    </form>
  `;

  const form = document.getElementById('2fa-form') as HTMLFormElement;
  const errorDisplay = document.getElementById('2fa-error') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = (document.getElementById('token') as HTMLInputElement).value;

        try {
            const uid = localStorage.getItem('uid');

            const response = await fetch(auth_endpoint('/2fa/verify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, id: uid })
            });

            const json = await response.json();

            if (!json.user) {
                errorDisplay.textContent = "Invalid token. Please try again.";
                errorDisplay.classList.remove("hidden");
                return;
            }

            localStorage.setItem('is_login', 'true');
            localStorage.setItem('uid', json.user.id);
            localStorage.setItem('username', json.user.username);
            localStorage.setItem('expires_at', json.expires_at);

            await navigate('/');

        } 

        catch (err) {
            console.error('2FA error', err);
            errorDisplay.textContent = "Something went wrong. Try again.";
            errorDisplay.classList.remove("hidden");
        }

    });

}
