
function toggleMenu() {
    const menu = document.getElementById("navMenu");
    if (menu) menu.classList.toggle("show");
}

function getData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data ?? [];
    } catch {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getAccount() {
    try {
        return JSON.parse(localStorage.getItem("hpAccount") || "null");
    } catch {
        return null;
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function requireLogin() {
    if (localStorage.getItem("hpLoggedIn") !== "true") {
        window.location.replace("index.html");
        return false;
    }
    return true;
}

async function logout() {
    localStorage.removeItem("hpLoggedIn");
    window.location.replace("index.html");
}

document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const protectedPages = [
        "home.html",
        "pets.html",
        "add-pet.html",
        "pet-details.html",
        "appointments.html",
        "book-appointment.html",
        "services.html",
        "consultation.html",
        "health-records.html",
        "notifications.html",
        "profile.html"
    ];

    if (protectedPages.includes(currentPage) && !requireLogin()) {
        return;
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const users = getData("happyPawsUsers");
            const user = users.find(item => String(item.email || "").toLowerCase() === email && item.password === password);
            if (!user) {
                alert("Login failed. Check your email and password, or create an account first.");
                return;
            }
            localStorage.setItem("currentUserEmail", user.email);
            localStorage.setItem("hpAccount", JSON.stringify({
                name: user.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email,
                phone: user.phone || ""
            }));
            localStorage.setItem("hpLoggedIn", "true");
            window.location.assign("home.html");
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const fullName = document.getElementById("fullname").value.trim();
            const email = document.getElementById("regEmail").value.trim().toLowerCase();
            const password = document.getElementById("regPassword").value;
            const confirm = document.getElementById("confirmPassword").value;
            if (!fullName || !email || !password || !confirm) {
                alert("Please complete all fields.");
                return;
            }
            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }
            if (password.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }
            const users = getData("happyPawsUsers");
            if (users.some(item => String(item.email || "").toLowerCase() === email)) {
                alert("This email is already registered. Please log in instead.");
                return;
            }
            const parts = fullName.split(/\s+/);
            const user = {
                id: String(Date.now()), name: fullName,
                firstName: parts[0] || "", lastName: parts.slice(1).join(" "),
                email, phone: "", password, owner: {}, pets: [], createdAt: new Date().toISOString()
            };
            users.push(user);
            saveData("happyPawsUsers", users);
            localStorage.setItem("currentUserEmail", email);
            localStorage.setItem("hpAccount", JSON.stringify({ name: fullName, firstName: user.firstName, lastName: user.lastName, email, phone: "" }));
            localStorage.setItem("hpLoggedIn", "true");
            alert("Account created successfully.");
            window.location.assign("home.html");
        });
    }

    document.querySelectorAll("[data-logout]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            logout();
        });
    });

    const petForm = document.getElementById("petForm");

    if (petForm) {
        petForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const pets = getData("hpPets");

            pets.push({
                id: Date.now(),
                name: document.getElementById("petName").value.trim(),
                type: document.getElementById("petType").value,
                breed: document.getElementById("petBreed").value.trim(),
                gender: document.getElementById("petGender").value,
                birth: document.getElementById("petBirth").value,
                color: document.getElementById("petColor").value.trim(),
                weight: document.getElementById("petWeight").value,
                notes: document.getElementById("petNotes").value.trim(),
                ownerName: (getAccount() || {}).name || "",
                ownerEmail: (getAccount() || {}).email || ""
            });

            saveData("hpPets", pets);
            alert("Pet information saved successfully.");
            window.location.assign("pets.html");
        });
    }

    const petList = document.getElementById("petList");

    if (petList) {
        const pets = getData("hpPets");

        petList.innerHTML = pets.length
            ? pets.map(pet => `
                <div class="pet-card">
                    <h3>🐾 ${escapeHTML(pet.name)}</h3>
                    <p>${escapeHTML(pet.type)} · ${escapeHTML(pet.breed)}</p>
                    <p>Gender: ${escapeHTML(pet.gender)}</p>
                    <a class="button-link" href="pet-details.html?id=${pet.id}">View Details</a>
                </div>
            `).join("")
            : `<div class="empty">
                <h3>No pets registered yet</h3>
                <p>Add your first pet to get started.</p>
                <a class="button-link" href="add-pet.html">Add Pet</a>
            </div>`;
    }

    const petDetails = document.getElementById("petDetails");

    if (petDetails) {
        const id = Number(new URLSearchParams(window.location.search).get("id"));
        const pet = getData("hpPets").find(item => item.id === id);

        petDetails.innerHTML = pet
            ? `
                <h2>🐾 ${escapeHTML(pet.name)}</h2>
                <p><b>Type:</b> ${escapeHTML(pet.type)}</p>
                <p><b>Breed:</b> ${escapeHTML(pet.breed)}</p>
                <p><b>Gender:</b> ${escapeHTML(pet.gender)}</p>
                <p><b>Date of Birth:</b> ${escapeHTML(pet.birth)}</p>
                <p><b>Color:</b> ${escapeHTML(pet.color)}</p>
                <p><b>Weight:</b> ${escapeHTML(pet.weight)} kg</p>
                <p><b>Medical Notes:</b> ${escapeHTML(pet.notes)}</p>
                <button class="danger" onclick="deletePet(${pet.id})">Delete Pet</button>
            `
            : `<p>Pet not found.</p><a href="pets.html">Back to My Pets</a>`;
    }

    const appointmentForm = document.getElementById("appointmentForm");

    if (appointmentForm) {
        const select = document.getElementById("appointmentPet");

        if (select) {
            select.innerHTML = '<option value="">Select a pet</option>';

            getData("hpPets").forEach(function (pet) {
                const option = document.createElement("option");
                option.value = pet.id;
                option.textContent = pet.name;
                select.appendChild(option);
            });
        }

        appointmentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!select) {
                alert("Pet selection field is missing.");
                return;
            }

            const appointments = getData("hpAppointments");
            const pets = getData("hpPets");
            const pet = pets.find(item => item.id === Number(select.value));

            if (!pet) {
                alert("Please add and select a pet first.");
                return;
            }

            appointments.push({
                id: Date.now(),
                pet: pet.name,
                service: document.getElementById("appointmentService").value,
                date: document.getElementById("appointmentDate").value,
                time: document.getElementById("appointmentTime").value,
                notes: document.getElementById("appointmentNotes").value,
                status: "Pending",
                ownerName: (getAccount() || {}).name || "",
                ownerEmail: (getAccount() || {}).email || ""
            });

            saveData("hpAppointments", appointments);
            alert("Appointment request saved.");
            window.location.assign("appointments.html");
        });
    }

    const appointmentList = document.getElementById("appointmentList");

    if (appointmentList) {
        const appointments = getData("hpAppointments");

        appointmentList.innerHTML = appointments.length
            ? `<div class="table-wrap">
                <table>
                    <tr>
                        <th>Pet</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                    ${appointments.map(item => `
                        <tr>
                            <td>${escapeHTML(item.pet)}</td>
                            <td>${escapeHTML(item.service)}</td>
                            <td>${escapeHTML(item.date)}</td>
                            <td>${escapeHTML(item.time)}</td>
                            <td><span class="status">${escapeHTML(item.status)}</span></td>
                        </tr>
                    `).join("")}
                </table>
            </div>`
            : `<div class="empty">
                <p>No appointments yet.</p>
                <a class="button-link" href="book-appointment.html">Book Appointment</a>
            </div>`;
    }

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");

    if (profileName && profileEmail) {
        const account = getAccount() || {};
        profileName.value = account.name || "";
        profileEmail.value = account.email || "";
    }

    const profileForm = document.getElementById("profileForm");

    if (profileForm && profileName) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const account = getAccount();

            if (!account) {
                alert("Account not found. Please register again.");
                return;
            }

            account.name = profileName.value.trim();
            saveData("hpAccount", account);
            alert("Profile updated successfully.");
        });
    }

    const consultationForm = document.getElementById("consultationForm");

    if (consultationForm) {
        consultationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const petInput = document.getElementById("consultPet");
            const concernInput = document.getElementById("consultConcern");

            if (!petInput || !concernInput) {
                alert("Consultation form fields are missing.");
                return;
            }

            const consultations = getData("hpConsultations");

            consultations.push({
                id: Date.now(),
                pet: petInput.value,
                concern: concernInput.value,
                diagnosis: concernInput.value,
                date: new Date().toISOString().slice(0, 10),
                status: "Pending",
                ownerName: (getAccount() || {}).name || "",
                ownerEmail: (getAccount() || {}).email || ""
            });

            saveData("hpConsultations", consultations);
            alert("Consultation request saved.");
            consultationForm.reset();
        });
    }

    const consultationList = document.getElementById("consultationList");

    if (consultationList) {
        consultationList.innerHTML = getData("hpConsultations").map(item => `
            <div class="pet-card">
                <h3>${escapeHTML(item.pet)}</h3>
                <p>${escapeHTML(item.concern)}</p>
                <p>${escapeHTML(item.date)}</p>
            </div>
        `).join("") || "<p>No consultation requests yet.</p>";
    }

    const notificationList = document.getElementById("notificationList");

    if (notificationList) {
        notificationList.innerHTML = getData("hpAppointments").map(item => `
            <div class="pet-card">
                <h3>📅 Appointment Request</h3>
                <p>${escapeHTML(item.pet)} — ${escapeHTML(item.service)}</p>
                <p>${escapeHTML(item.date)} at ${escapeHTML(item.time)}</p>
                <span class="status">${escapeHTML(item.status)}</span>
            </div>
        `).join("") || "<p>No notifications yet.</p>";
    }

    const serviceList = document.getElementById("serviceList");
    if (serviceList) {
        const services = getData("hpServices").filter(service =>
            String(service.status || "Available").toLowerCase() === "available"
        );
        if (services.length) {
            serviceList.innerHTML = services.map(service => `
                <div class="dashboard-card">
                    <span>🐾</span>
                    <h3>${escapeHTML(service.name || service.serviceName || "Pet Service")}</h3>
                    <p>${escapeHTML(service.description || service.category || "Pet care service")}</p>
                    <p><b>₱${escapeHTML(service.price ?? "Contact clinic")}</b></p>
                    <a class="button-link" href="book-appointment.html">Book Now</a>
                </div>
            `).join("");
        }
    }

    const healthPet = document.getElementById("healthPet");

    if (healthPet) {
        healthPet.innerHTML = getData("hpPets").map(pet => `
            <div class="pet-card">
                <h3>🐾 ${escapeHTML(pet.name)}</h3>
                <p>${escapeHTML(pet.notes || "No medical notes recorded.")}</p>
                <p>Breed: ${escapeHTML(pet.breed)}</p>
            </div>
        `).join("") || "<p>Add a pet to view health records.</p>";
    }
});

function deletePet(id) {
    if (!confirm("Delete this pet?")) return;

    saveData(
        "hpPets",
        getData("hpPets").filter(pet => pet.id !== id)
    );

    window.location.assign("pets.html");
}
