import { navigate } from "./router";
import { auth_endpoint } from "./provider/api";

export function registerPage() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

      <form id="register-form" class="form">

        <h2 class="text-large">REGISTER</h2>

        <input type="text" id="username" placeholder="Username" required class="form-field"/>
        <input type="email" id="email" placeholder="Email" required class="form-field"/>
        <input type="password" id="password" placeholder="Password" required class="form-field"/>
        <input type="password" id="password-confirm" placeholder="Confirm Password" required class="form-field"/>

        <button type="submit" class="form-button">Submit</button>

      </form>
    `;

    const form = document.getElementById('register-form') as HTMLFormElement;

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const password_confirm = (document.getElementById('password-confirm') as HTMLInputElement).value;
        const forbidden_regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

        if (forbidden_regex.test(username)) {
            alert('Username must not contains any special characters or whitespaces');
            return;
        }

        if (username.length > 24) {
            alert('Username must be in 24 characters');
            return;
        }

        if (password !== password_confirm) {
            alert('Password unmatched');
            return;
        }

        if (password.length < 6) {
            alert('Password length must be longer than 6 characters');
            return;
        }

        try {
            const response = await fetch(auth_endpoint('/user'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    mail: email,
                    password: password
                })
            });

            if (!response.ok) {
                const errorText = await response.json();
                alert(`Registration failed: ${errorText.error}`);
                return;
            }

            const json = await response.json();

            localStorage.setItem('is_login', 'true');
            localStorage.setItem('uid', json.user.id);
            localStorage.setItem('username', json.user.username);
            localStorage.setItem('expires_at', json.expires_at);
            await navigate('/');
        }
        catch (err) {
            console.error(err);
            alert('An error occurred while registering. Please try again.');
        }
    });
}
