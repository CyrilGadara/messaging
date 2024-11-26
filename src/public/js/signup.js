document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const successMessage = document.getElementById("successMessage");

    function clearErrors() {
        document.querySelectorAll(".form-response-message").forEach((el) => (el.textContent = ""));
    }

    function showError(field, message) {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();
        successMessage.style.display = "none";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                successMessage.textContent = result.message;
                successMessage.style.display = "block";
                form.reset();
            } else {
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach((error) => {
                        showError(error.path, error.msg);
                    });
                } else if (result.message) {
                    // Handle any general error messages
                    showError("username", result.message);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            showError("username", "An error occurred. Please try again later.");
        }
    }

    form.addEventListener("submit", handleSubmit);
});
