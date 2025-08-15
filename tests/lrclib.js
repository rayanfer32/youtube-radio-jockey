async function callLyricsAPI(query) {

    const response = await fetch(`https://lrclib.net/api/search?q=${query}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Brave\";v=\"139\", \"Chromium\";v=\"139\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1"
        },
        "referrer": "https://lrclib.net/docs",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    });

    if (!response.ok) {
        throw new Error(`Lyrics API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

await callLyricsAPI('Hoang - Run Back to You')
