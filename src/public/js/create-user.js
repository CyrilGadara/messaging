const form = document.querySelector("#createUserForm");

function clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"));
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const loading = document.querySelector("#loading");
    const successMessage = document.querySelector("#successMessage");
    const submitBtn = document.querySelector(".submit-btn");

    const formData = new FormData(e.target);

    try {
        loading.style.display = "block";
        submitBtn.style.display = "none";

        const response = await fetch("/auth/create-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        const data = await response.json();

        if (!data.success) {
            if (data.errors) {
                data.errors.forEach((error) => {
                    const errorElement = document.getElementById(`${error.path}Error`);
                    if (errorElement) {
                        errorElement.textContent = error.msg;
                        errorElement.style.display = "block";
                        loading.style.display = "none";
                        submitBtn.style.display = "block";
                    }
                });
            }
        } else {
            successMessage.style.display = "block";
            loading.style.display = "none";
            submitBtn.style.display = "block";
            form.reset();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to create user. Please try again.");
        loading.style.display = "none";
        submitBtn.style.display = "block";
    }
});