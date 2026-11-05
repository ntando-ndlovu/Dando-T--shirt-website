document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // 1. IMAGE LIGHTBOX
    const lightbox = document.createElement("div");
    lightbox.id = "image-lightbox";

    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Enlarged image");

    lightbox.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.93);
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        cursor: zoom-out;
    `;

    const enlargedImage = document.createElement("img");

    enlargedImage.alt = "";
    enlargedImage.style.cssText = `
        display: block;
        max-width: 95%;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        cursor: zoom-out;
    `;

    lightbox.appendChild(enlargedImage);
    document.body.appendChild(lightbox);

    let previousImage = null;

    function openLightbox(image) {
        previousImage = image;
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt || "Enlarged image";

        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        enlargedImage.removeAttribute("src");
        document.body.style.overflow = "";

        if (previousImage) {
            previousImage.focus();
        }
    }

    document.querySelectorAll("img").forEach(function (image) {
        if (image.dataset.noLightbox === "true") return;

        image.style.cursor = "zoom-in";
        image.setAttribute("tabindex", "0");
        image.setAttribute("role", "button");

        image.addEventListener("click", function (event) {
            if (image.closest("a")) {
                event.preventDefault();
            }

            openLightbox(image);
        });

        image.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    // Clicking the dark background closes the lightbox.
    lightbox.addEventListener("click", closeLightbox);

    // Escape key also closes the lightbox.
    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            lightbox.style.display === "flex"
        ) {
            closeLightbox();
        }
    });

    // 2. FORM VALIDATION
    document.querySelectorAll("form").forEach(function (form) {

        // Skip product search forms.
        if (
            form.querySelector('input[type="search"]') ||
            form.getAttribute("role") === "search"
        ) {
            return;
        }

        const status = document.createElement("p");

        status.className = "form-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");

        status.style.cssText = `
            margin-top: 15px;
            font-weight: 600;
            line-height: 1.6;
        `;

        form.appendChild(status);

        // Clear old validation messages when fields are edited.
        form.querySelectorAll("input, textarea, select").forEach(function (field) {
            field.addEventListener("input", function () {
                field.setCustomValidity("");
                status.textContent = "";
            });

            field.addEventListener("change", function () {
                field.setCustomValidity("");
                status.textContent = "";
            });
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            status.textContent = "";
            status.style.color = "";

            // Check email BEFORE general browser validation.
            const emailFields = form.querySelectorAll(
                'input[type="email"], input[name*="email" i], input[id*="email" i]'
            );

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            for (const field of emailFields) {
                const email = field.value.trim();

                if (email === "" && field.required) {
                    // Let the required-field check handle empty email fields.
                    continue;
                }

                if (email !== "" && !emailPattern.test(email)) {
                    if (field.id === "contactEmail") {
                        alert(
                            "Invalid Email Address!\n\nPlease fix your email address and try again."
                        );
                    } else {
                        field.setCustomValidity(
                            "Please enter a valid email address."
                        );
                        field.reportValidity();
                    }

                    field.focus();
                    return;
                }

                field.setCustomValidity("");
            }

            // Check all remaining required fields and HTML rules.
            if (!form.reportValidity()) {
                return;
            }

            // TELEPHONE VALIDATION
            const phoneFields = form.querySelectorAll(
                'input[type="tel"], input[name*="phone" i], input[id*="phone" i], input[name*="telephone" i], input[id*="telephone" i]'
            );

            const phonePattern = /^\+?[0-9\s()-]+$/;

            for (const field of phoneFields) {
                const phone = field.value.trim();

                if (phone === "") continue;

                const digitCount = phone.replace(/\D/g, "").length;

                if (
                    !phonePattern.test(phone) ||
                    digitCount < 9 ||
                    digitCount > 15
                ) {
                    field.setCustomValidity(
                        "Please enter a valid telephone number using digits, spaces, brackets or hyphens."
                    );
                    field.reportValidity();
                    field.focus();
                    return;
                }

                field.setCustomValidity("");
            }

            // SUCCESS MESSAGE
            status.style.color = "#15803d";
            status.textContent =
                "Thank you! Your form has been submitted successfully.";

            form.reset();

            status.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });
    });

    // 3. AUTOMATIC FOOTER YEAR
    document.querySelectorAll("[data-current-year]").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });
});