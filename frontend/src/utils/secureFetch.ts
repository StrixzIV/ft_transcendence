import { auth_endpoint } from "@/provider/api";

export async function secureFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {

    let options: RequestInit = { ...init, credentials: 'include' };

    if (options.body instanceof FormData && options.headers) {
        const headers = new Headers(options.headers);
        headers.delete("Content-Type");
        options.headers = headers;
    }

    let response = await fetch(input, options);

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
