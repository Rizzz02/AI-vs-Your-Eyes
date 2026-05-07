const uploadInput = document.getElementById("uploadInput");
const yourImage = document.getElementById("yourImage");
const aiImage = document.getElementById("aiImage");

uploadInput.addEventListener("change", async function () {
    const file = this.files[0];

    if (!file) return;

    console.log("File selected:", file.name);

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
        const res = await fetch("https://your-app.onrender.com/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("Backend:", data);

        // LOAD AI RESULT
        aiImage.src = "https://your-app.onrender.com/upload" + new Date().getTime();

    } catch (err) {
        console.error(err);
    }
});
