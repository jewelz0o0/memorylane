(() => {
  const container = document.querySelector("#sib-form-container");
  const successPanel = document.querySelector("#success-message");
  const emailInput = document.querySelector("#EMAIL");
  const sibContainer = document.querySelector("#sib-container");

  if (!container || !successPanel || !emailInput) return;

  const onSuccess = () => {
    emailInput.value = "";
    if (sibContainer) sibContainer.style.display = "";
    window.MLY_showCalendarSync?.();
  };

  const observer = new MutationObserver(() => {
    if (successPanel.classList.contains("sib-form-message-panel--active")) {
      onSuccess();
    }
  });

  observer.observe(successPanel, { attributes: true, attributeFilter: ["class"] });

  emailInput.addEventListener("input", () => {
    successPanel.classList.remove("sib-form-message-panel--active");
    container.querySelector("#error-message")?.classList.remove("sib-form-message-panel--active");
  });
})();
