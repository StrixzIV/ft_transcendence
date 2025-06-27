import { mainPage } from "./main";
import { registerPage } from "./register";

export function loginPage() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

      <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">

        <form id="login-form" class="bg-gray-800 p-8 rounded shadow-md space-y-4 w-80">

          <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>

          <input type="email" id="email" placeholder="Email" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          <input type="password" id="password" placeholder="Password" required class="w-full p-2 rounded bg-gray-700 text-white"/>
          
          <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">Login</button>
          
          <div class="text-center my-2">or</div>
          <button id="google-login" type="button" class="w-full bg-red-500 hover:bg-red-600 p-2 rounded">Login with Google</button>
          <button id="register" type="button" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">Register</button>
        
          <button id="home" class="hover:bg-green-400">Return to homepage</button>

        </form>
        

      </div>
    `;
  
    // Handle email login
    const form = document.getElementById('login-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
        
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
    
        // Normally you'd send this to your backend
        console.log('Login with', { email, password });
        alert(`Logged in as ${email}`);

        localStorage.setItem('is_login', 'true');
        window.location.reload();

    });

    const homeBtn = document.getElementById('home') as HTMLButtonElement;

    homeBtn.addEventListener('click', () => {
        mainPage();
    })

    const registerBtn = document.getElementById('register') as HTMLButtonElement;

    registerBtn.addEventListener('click', () => {
        registerPage();
    })
  
    // Handle Google login
    // const googleBtn = document.getElementById('google-login')!;
    // googleBtn.addEventListener('click', handleGoogleLogin);
}
  