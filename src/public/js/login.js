document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const loginErrors = document.querySelector("#loginError");

    function clearErrors() {
        loginErrors.style.display = "none";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log(result);
            if (result.success) {
                // Redirect to a dashboard or home page
                window.location.href = "/campaigns";
            } else {
                loginErrors.style.display = "block";
                loginErrors.textContent = result.message;
            }
        } catch (error) {
            console.error("Error:", error);

            loginErrors.style.display = "block";
        }
    }

    form.addEventListener("submit", handleSubmit);
});
