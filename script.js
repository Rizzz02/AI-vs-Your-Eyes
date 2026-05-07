const uploadInput = document.getElementById("uploadInput");
const yourImage = document.getElementById("yourImage");
const aiImage = document.getElementById("aiImage");
const btnTrustYours = document.getElementById("btn-trust-yours");
const btnTrustAI = document.getElementById("btn-trust-ai");
const choiceFeedback = document.getElementById("choice-feedback");

// ============================================================
// INLINE FEEDBACK (existing functionality kept intact)
// ============================================================
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

// ============================================================
// MODAL POPUP (new feedback layer)
// ============================================================
const modalOverlay = document.getElementById("trust-modal-overlay");
const modalCard = document.getElementById("trust-modal-card");
const modalContent = document.getElementById("trust-modal-content");
const modalClose = document.getElementById("trust-modal-close");

let modalTimer = null;

function openTrustModal(messageHTML) {
    if (!modalOverlay || !modalContent) return;

    // Clear any previous auto-close timer
    if (modalTimer) {
        clearTimeout(modalTimer);
        modalTimer = null;
    }

    // Set content
    modalContent.innerHTML = messageHTML;

    // Show overlay
    modalOverlay.classList.add("is-open");
    modalOverlay.setAttribute("aria-hidden", "false");

    // Auto-dismiss after 3 seconds
    modalTimer = setTimeout(() => {
        closeTrustModal();
    }, 3000);
}

function closeTrustModal() {
    if (!modalOverlay) return;

    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");

    if (modalTimer) {
        clearTimeout(modalTimer);
        modalTimer = null;
    }
}

// Close button click
if (modalClose) {
    modalClose.addEventListener("click", closeTrustModal);
}

// Click on overlay background (outside card) to close
if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeTrustModal();
        }
    });
}

// Close on ESC key press
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("is-open")) {
        closeTrustModal();
    }
});

// ============================================================
// IMAGE UPLOAD HANDLING (backend logic untouched)
// ============================================================
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

// ============================================================
// TRUST BUTTON HANDLERS (inline + modal popup)
// ============================================================
if (btnTrustYours && btnTrustAI && choiceFeedback) {
    btnTrustYours.addEventListener("click", () => {
        const msg = "You trust your photo. Human instinct still leads the way.<br><strong>Thank you for participating.</strong>";
        showFeedback(msg, false);

        // Also show the modal popup with a cleaner formatted message
        openTrustModal(`
            <p>You trust your photo.</p>
            <p style="font-size: 1.1rem; margin-top: 0.5rem;">Human instinct still leads the way.</p>
            <p style="margin-top: 1.2rem;"><strong>Thank you for participating.</strong></p>
        `);
    });

    btnTrustAI.addEventListener("click", () => {
        const msg = "You trust the AI. Interesting—algorithmic judgment is starting to feel convincing.<br><strong>Thank you for participating.</strong>";
        showFeedback(msg, true);

        openTrustModal(`
            <p>You trust the AI.</p>
            <p style="font-size: 1.1rem; margin-top: 0.5rem;">Interesting—algorithmic judgment is starting to feel convincing.</p>
            <p style="margin-top: 1.2rem;"><strong>Thank you for participating.</strong></p>
        `);
    });
}
