
import fs from 'node:fs';

async function test() {
    const url = "https://moltbot-sandbox.pyhgoshift.workers.dev/ask";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: "Hello" })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
