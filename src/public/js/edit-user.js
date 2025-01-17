const form = document.querySelector("#editUserForm");
const successMessage = document.querySelector("#successMessage");
const userId = form.dataset.userId;
const userName = form.dataset.userName;

const deleteUserBtn = document.querySelector("#deleteUserBtn");
const modal = document.querySelector("#deleteModal");
const modalContent = document.querySelector("#modal-main-content");
const modalSuccessMessage = document.querySelector("#modalSuccessMessage");
const modalErrorMessage = document.querySelector("#modalErrorMessage");
console.log(modalErrorMessage);
const cancelBtn = document.querySelector("#cancelBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
const usernameInput = document.querySelector("#usernameInput");

deleteUserBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    usernameInput.value = "";
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.classList.remove("enabled");
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

usernameInput.addEventListener("input", () => {
    if (usernameInput.value === userName) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.classList.add("enabled");
    } else {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.classList.remove("enabled");
    }
});

confirmDeleteBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(`/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        console.log(data);
        if (!data.success) {
            modalErrorMessage.style.display = "block";

            setTimeout(() => {
                modalErrorMessage.style.display = "none";
            }, 2000);
        } else {
            modalSuccessMessage.style.display = "block";
            modalContent.style.display = "none";
            setTimeout(() => {
                window.location.href = "/users";
            }, 2000);
        }
    } catch (error) {
        console.error("Error:", error);
        modalErrorMessage.style.display = "block";
        modalContent.style.display = "none";
    }
});

window.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
        deleteModal.style.display = "none";
    }
});

function clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"));
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const loading = document.querySelector("#loading");
    const formActions = document.querySelector(".form-actions");

    const formData = new FormData(e.target);

    try {
        loading.style.display = "block";
        formActions.style.display = "none";

        const response = await fetch(`/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        const data = await response.json();
        console.log(data);
        if (!data.success) {
            if (data.errors) {
                data.errors.forEach((error) => {
                    const errorElement = document.getElementById(`${error.path}Error`);
                    if (errorElement) {
                        errorElement.textContent = error.msg;
                        errorElement.style.display = "block";
                        loading.style.display = "none";
                        formActions.style.display = "flex";
                    }
                });
            }
            window.scrollTo(0, 0);
        } else {
            successMessage.style.display = "block";
            window.scrollTo(0, 0);
            loading.style.display = "none";
            formActions.style.display = "flex";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to update user. Please try again.");
        loading.style.display = "none";
        formActions.style.display = "flex";
    }
});
