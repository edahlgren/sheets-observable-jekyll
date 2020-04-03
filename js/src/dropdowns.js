function hideAll(dropdowns) {
  dropdowns.forEach(function(d) {
    d.menu.classList.add("invisible");
    d.button.classList.remove("dd-button-highlight");
  });
}

function hideOnClickOutside(menu, button) {
  function outsideClickListener(event) {
    var hidden = menu.classList.contains("invisible");
    if (!hidden && !menu.contains(event.target)) {
      menu.classList.add("invisible");
      button.classList.remove("dd-button-highlight");
      document.removeEventListener('click', outsideClickListener);
    }
  }
  document.addEventListener('click', outsideClickListener);
}

function setup_dropdown(dropdowns, button, menu) {
  var button_width = button.offsetWidth + 8,
      menu_width = menu.offsetWidth;
  menu.style.left = (button_width - menu_width) + "px";

  button.addEventListener('click', function(event) {
    if (menu.classList.contains("invisible")) {
      hideAll(dropdowns);
      button.classList.add("dd-button-highlight");
      menu.classList.remove("invisible");
      event.stopPropagation();
      hideOnClickOutside(menu, button);
    } else {
      menu.classList.add("invisible");
      button.classList.remove("dd-button-highlight");
    }
  });
}

function setup_dropdowns(dropdowns) {
  dropdowns.forEach(function(d) {
    setup_dropdown(dropdowns, d.button, d.menu);
  });
}

export { setup_dropdowns as setupDropdowns };
