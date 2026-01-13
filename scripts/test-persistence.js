
const { savePresentation, getPresentation } = require('../lib/store');

async function test() {
    console.log("Starting persistence test...");

    const testId = "test-persist-" + Date.now();
    const testPresentation = {
        id: testId,
        title: "Test Persistence",
        theme: "default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slides: [
            {
                id: "slide-1",
                content: JSON.stringify([{ id: "el-1", type: "text", content: "Persistence Works!" }]),
                background: "#ffffff",
                layout: "blank"
            }
        ],
        shortCode: "12345"
    };

    console.log("Saving presentation...");
    await savePresentation(testPresentation);

    console.log("Reading back presentation...");
    const saved = await getPresentation(testId);

    if (saved && saved.slides[0].content === testPresentation.slides[0].content) {
        console.log("SUCCESS: Data persisted correctly!");
    } else {
        console.error("FAILURE: Data mismatch or not found.");
        console.log("Expected:", testPresentation.slides[0].content);
        console.log("Received:", saved ? saved.slides[0].content : "null");
    }
}

test().catch(console.error);
