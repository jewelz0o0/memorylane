(() => {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  const footerNewsletter = document.getElementById("footer-newsletter");
  if (footerNewsletter) {
    footerNewsletter.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }
})();
