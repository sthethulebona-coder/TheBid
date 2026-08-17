document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("LoginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById("username").value.trim();
            const passwordInput = document.getElementById("password").value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem("currentUser", data.username);
                    window.location.href = "HomePage.html";
                } else {
                    errorMessage.textContent = data.message || "Login failed.";
                }
            } catch (err) {
                errorMessage.textContent = "Server connection error.";
            }
        });
    }
});