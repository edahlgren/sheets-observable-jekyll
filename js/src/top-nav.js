import { setupModals } from "./modals.js";

function setup_top_nav() {
  setupModals([
    {
      button: document.getElementById("saved-reports-button"),
      container: document.getElementById("saved-reports-popup"),
      popup: document.getElementById("saved-reports-popup").querySelector(".popup"),
      close: document.getElementById("saved-reports-popup").querySelector(".popup-close")
    },
    {
      button: document.getElementById("settings-button"),
      container: document.getElementById("settings-popup"),
      popup: document.getElementById("settings-popup").querySelector(".popup"),
      close: document.getElementById("settings-popup").querySelector(".popup-close")
    }
  ]);
}

export { setup_top_nav as setupTopNav };
