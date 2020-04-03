function hideOnClickOutside(container, popup) {
  function outsideClickListener(event) {
    var hidden = container.classList.contains("hidden");
    if (!hidden && !popup.contains(event.target)) {
      container.classList.add("hidden");
      document.removeEventListener('click', outsideClickListener);
    }
  }
  document.addEventListener('click', outsideClickListener);
}

function setup_modal(button, container, popup, close) {
  button.addEventListener('click', function(event) {
  	container.classList.remove("hidden");
    event.stopPropagation();
    hideOnClickOutside(container, popup);
  });

  close.addEventListener('click', function(event) {
  	container.classList.add("hidden");
  });
}

function setup_modals(modals) {
  modals.forEach(function(m) {
    setup_modal(m.button, m.container, m.popup, m.close);
  });
}

export { setup_modals as setupModals };
