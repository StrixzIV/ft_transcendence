import { auth_endpoint } from "@/provider/api";

export async function secureFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let response = await fetch(input, { ...init, credentials: 'include' });

    if (response.status === 401) {
        const refreshRes = await fetch(auth_endpoint('/refresh'), {
            method: 'POST',
            credentials: 'include'
        });

        if (refreshRes.ok) {
            response = await fetch(input, { ...init, credentials: 'include' });
        }
        else {
            await fetch(auth_endpoint('/logout'), {
                method: 'POST',
                credentials: 'include'
            });
            localStorage.clear();
            window.location.reload();
        }
    }

    return response;
}
