import { auth_endpoint } from "./provider/api";

export function twoFactorPage() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

    <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <form id="2fa-form" class="bg-gray-800 p-8 rounded shadow-md space-y-4 w-80">

        <h2 class="text-2xl font-bold mb-4 text-center">Two-Factor Authentication</h2>

        <p class="text-sm text-gray-400 text-center">Enter the 6-digit code from your Google Authenticator app</p>

        <input
          type="text"
          id="token"
          maxlength="6"
          pattern="\\d{6}"
          placeholder="123456"
          required
          class="w-full p-2 rounded bg-gray-700 text-white text-center tracking-widest text-xl"
        />

        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">
          Verify Token
        </button>

        <div id="2fa-error" class="text-red-400 text-sm text-center hidden"></div>

      </form>

    </div>
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
                body: JSON.stringify({ token, uid })
            });

            const json = await response.json();

            if (!json.valid) {
                errorDisplay.textContent = "Invalid token. Please try again.";
                errorDisplay.classList.remove("hidden");
                return;
            }

            localStorage.setItem('is_login', 'true');
            localStorage.setItem('uid', json.user.id);
            localStorage.setItem('username', json.user.username);
            localStorage.setItem('expires_at', json.expires_at);

            window.location.reload();
        } 
        catch (err) {
            console.error('2FA error', err);
            errorDisplay.textContent = "Something went wrong. Try again.";
            errorDisplay.classList.remove("hidden");
        }

    });

}
