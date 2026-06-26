var root = document.getElementById("welcomeRoot");
var statusText = document.getElementById("statusText");
var channelReadout = document.getElementById("channelReadout");
var actionLink = document.getElementById("actionLink");
var inShell = typeof window.inovar !== "undefined";

async function attemptHandshake() {
  if (!inShell) {
    root.classList.remove("hidden");
    statusText.textContent = "acesso restrito";
    channelReadout.textContent = "terminal não reconhecido";
    actionLink.style.display = "none";
    return;
  }

  try {
    var ok = await window.inovar.authenticate();

    if (ok) {
      sessionStorage.setItem("inovar_authenticated", "true");
      window.location.href = "welcome.html";
      return;
    }
  } catch (err) {}

  root.classList.remove("hidden");
  statusText.textContent = "acesso restrito";
  channelReadout.textContent = "canal: bloqueado";
  actionLink.style.display = "none";
}

attemptHandshake();
