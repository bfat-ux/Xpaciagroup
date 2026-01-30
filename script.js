/* Hero carousel */
const carousel = document.getElementById("hero-carousel");
if (carousel) {
  const items = carousel.querySelectorAll(".carousel-item");
  const prevBtn = carousel.querySelector(".carousel-prev");
  const nextBtn = carousel.querySelector(".carousel-next");
  const indicatorBtns = carousel.querySelectorAll(".carousel-indicators button");
  let index = 0;
  const total = items.length;

  const goTo = (i) => {
    index = (i + total) % total;
    items.forEach((el, j) => el.classList.toggle("active", j === index));
    indicatorBtns.forEach((el, j) => el.classList.toggle("active", j === index));
  };

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
  indicatorBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => goTo(Number(btn.getAttribute("data-index"))));
  });

  let autoplay = setInterval(() => goTo(index + 1), 5000);
  carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
  carousel.addEventListener("mouseleave", () => {
    autoplay = setInterval(() => goTo(index + 1), 5000);
  });
}

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

const closeNav = () => {
  if (!siteNav || !navToggle) {
    return;
  }
  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const toggleNav = () => {
  if (!siteNav || !navToggle) {
    return;
  }
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
};

if (navToggle) {
  navToggle.addEventListener("click", toggleNav);
}

if (siteNav) {
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
}

document.addEventListener("click", (event) => {
  if (!siteNav || !navToggle) {
    return;
  }
  const target = event.target;
  if (
    siteNav.classList.contains("is-open") &&
    target instanceof Node &&
    !siteNav.contains(target) &&
    !navToggle.contains(target)
  ) {
    closeNav();
  }
});

const contactForm = document.querySelector("#contact-form");
const statusEl = document.querySelector(".form-status");

const setStatus = (message, isError = false) => {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
};

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint =
      contactForm.getAttribute("data-endpoint") || "/api/contact";
    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject") || "",
      message: formData.get("message"),
    };

    setStatus("Sending your message...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        throw new Error(error || "Something went wrong. Please try again.");
      }

      setStatus("Thanks! Your message has been sent.");
      contactForm.reset();
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

