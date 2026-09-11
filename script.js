const urlInput = document.getElementById("urlInput");
const shortenButton = document.getElementById("shortenButton");

const result = document.getElementById("result");
const shortUrl = document.getElementById("shortUrl");
const copyButton = document.getElementById("copyButton");

const message = document.getElementById("message");

// Deine korrekte Cloudflare Worker-URL ist jetzt eingetragen
const WORKER_URL = "https://url-shortener.philipjanssen.workers.dev";

shortenButton.addEventListener("click", async () => {
    const url = urlInput.value.trim();

    message.textContent = "";

    if (!url) {
        message.textContent = "Bitte gib eine URL ein.";
        return;
    }

    try {
        new URL(url);
    } catch {
        message.textContent = "Bitte gib eine gültige URL ein.";
        return;
    }

    shortenButton.disabled = true;
    shortenButton.textContent = "Lädt...";

    try {
        // fetch-Aufruf optimiert (CORS-Modus explizit erzwungen)
        const response = await fetch(`${WORKER_URL}/api/shorten`, {
            method: "POST",
            mode: "cors", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });

        // Wenn der Server mit einem Fehler antwortet (z. B. 400, 500)
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server antwortete mit Status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Den Kurzlink zusammensetzen
        const generatedUrl = `${WORKER_URL}/${data.code}`;

        shortUrl.value = generatedUrl;
        result.classList.remove("hidden");
    } catch (error) {
        // Gibt den genauen Fehler in der roten Textbox aus
        message.textContent = `Fehler: ${error.message || "Verbindung fehlgeschlagen"}`;
        console.error("Detaillierter Fehler:", error);
    } finally {
        shortenButton.disabled = false;
        shortenButton.textContent = "URL kürzen";
    }
});

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(shortUrl.value);
        copyButton.textContent = "Kopiert!";

        setTimeout(() => {
            copyButton.textContent = "Kopieren";
        }, 1500);
    } catch {
        message.textContent = "Kopieren nicht möglich.";
    }
});
