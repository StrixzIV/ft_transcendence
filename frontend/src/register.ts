export function registerPage() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

      <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">

        <form id="register-form" class="bg-gray-800 p-8 rounded shadow-md space-y-4 w-80">

          <h2 class="text-2xl font-bold mb-4 text-center">Register</h2>

          <input type="text" id="username" placeholder="Username" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          <input type="email" id="email" placeholder="Email" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          <input type="password" id="password" placeholder="Password" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          <input type="password" id="password-confirm" placeholder="Confirm Password" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          
          <button type="submit" class="w-full bg-green-500 hover:bg-green-600 p-2 rounded">Submit</button>

        </form>
        

      </div>
    `;

    const form = document.getElementById('register-form') as HTMLFormElement;

    form.addEventListener('submit', async(e) => {
        
        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const password_confirm = (document.getElementById('password-confirm') as HTMLInputElement).value;
    
        const forbidden_regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

        if (forbidden_regex.test(username)) {
            alert('Username must not contains any special characters or whitespaces')
            return
        }

        if (password !== password_confirm) {
            alert('Password unmatched')
            return
        }
        
        if (password.length < 6) {
            alert('Password length must be longer than 6 characters')
            return
        }

        try {

            const response = await fetch('http://localhost:3000/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: username,
                    mail: email,
                    password: password
                })
            });
        
            if (!response.ok) {
                const errorText = await response.text() as string;
                alert(`Registration failed: ${errorText}`);
                return;
            }
        
            localStorage.setItem('is_login', 'true');
            window.location.reload();
        
        }
        
        catch (err) {
            console.error(err);
            alert('An error occurred while registering. Please try again.');
        }

    });
    
}
  