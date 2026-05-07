const uploadInput = document.getElementById("uploadInput");
const yourImage = document.getElementById("yourImage");
const aiImage = document.getElementById("aiImage");
const btnTrustYours = document.getElementById("btn-trust-yours");
const btnTrustAI = document.getElementById("btn-trust-ai");
const choiceFeedback = document.getElementById("choice-feedback");

function showFeedback(message, isAIChoice) {
    if (!choiceFeedback) return;

    choiceFeedback.textContent = message;
    choiceFeedback.classList.add("is-visible");

    if (btnTrustYours) btnTrustYours.classList.remove("active");
    if (btnTrustAI) btnTrustAI.classList.remove("active");

    if (isAIChoice) {
        if (btnTrustAI) btnTrustAI.classList.add("active");
    } else {
        if (btnTrustYours) btnTrustYours.classList.add("active");
    }
}

uploadInput.addEventListener("change", async function () {
    const file = this.files[0];

    if (!file) return;

    console.log("File selected:", file.name);

    // Reset feedback when a new image is uploaded
    if (choiceFeedback) {
        choiceFeedback.textContent = "";
        choiceFeedback.classList.remove("is-visible");
    }
    if (btnTrustYours) btnTrustYours.classList.remove("active");
    if (btnTrustAI) btnTrustAI.classList.remove("active");

    // SHOW ORIGINAL IMAGE
    const reader = new FileReader();
    reader.onload = function (e) {
        console.log("Original loaded");
        yourImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // SEND TO BACKEND
    const formData = new FormData();
    formData.append("image", file);

    try {
        aiImage.src = "https://i.gifer.com/ZZ5H.gif";

        const res = await fetch("https://ai-vs-your-eyes.onrender.com/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("Backend:", data);

        // LOAD AI RESULT
        aiImage.src = "https://ai-vs-your-eyes.onrender.com/result?t=" + new Date().getTime();

    } catch (err) {
        console.error(err);
    }
});

if (btnTrustYours && btnTrustAI && choiceFeedback) {
    btnTrustYours.addEventListener("click", () => {
        showFeedback(
            "You trust your photo. Human instinct still leads the way.<br><strong>Thank you for participating.</strong>",
            false
        );
    });

    btnTrustAI.addEventListener("click", () => {
        showFeedback(
            "You trust the AI. Interesting—algorithmic judgment is starting to feel convincing.<br><strong>Thank you for participating.</strong>",
            true
        );
    });
}
