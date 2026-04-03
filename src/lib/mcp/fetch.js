const HOST = 'https://statsapi.mlb.com';
export async function fetchMLB(endpoint, params) {
    const url = new URL(endpoint, HOST);
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value == null)
            continue;
        url.searchParams.set(key, typeof value !== 'string' ? [value].flat().join(',') : value);
    }
    try {
        const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) {
            const body = await response.text().catch(() => '(unreadable body)');
            const error = new Error(`MLB API ${response.status}: ${url.pathname}`);
            console.error('[fetchMLB] HTTP error', {
                status: response.status,
                url: decodeURIComponent(url.toString()),
                body,
            });
            throw error;
        }
        const json = await response.json();
        if (typeof json?.messageNumber === 'number') {
            const err = new Error(`MLB API error: ${json.message ?? 'unknown'} (${url.pathname})`);
            console.error('[fetchMLB] Error body on 200', {
                messageNumber: json.messageNumber,
                message: json.message,
                url: decodeURIComponent(url.toString()),
            });
            throw err;
        }
        return json;
    }
    catch (error) {
        if (error instanceof Error && error.message.startsWith('MLB API'))
            throw error;
        console.error('[fetchMLB] Unexpected error', {
            url: decodeURIComponent(url.toString()),
            error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        });
        throw error;
    }
}
