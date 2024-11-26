document.addEventListener("DOMContentLoaded", function () {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
        input.addEventListener("change", function (e) {
            const fileName = e.target.files[0]?.name || "No file chosen";
            e.target.nextElementSibling.textContent = fileName;
        });
    });
});
