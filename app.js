const statusText = document.getElementById("statusText");
const channelReadout = document.getElementById("channelReadout");
const actionLink = document.getElementById("actionLink");

const inShell = typeof window.inovar !== "undefined";

async function attemptHandshake() {
  if (!inShell) {
    statusText.textContent = "acesso direto · modo público";
    channelReadout.textContent = "canal: web · pública";
    actionLink.textContent = "→ entrar no motor";
    return;
  }

  statusText.textContent = "a estabelecer sintonia…";
  channelReadout.textContent = "canal: ponte interna";

  try {
    const ok = await window.inovar.authenticate();

    if (ok) {
      statusText.textContent = "canal interno · sintonia confirmada";
      channelReadout.textContent = "ponte interna · segura";
      sessionStorage.setItem("inovar_authenticated", "true");
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 1400);
    } else {
      statusText.textContent = "sem sintonia · modo público";
      channelReadout.textContent = "canal: web · pública";
      actionLink.textContent = "→ entrar no motor";
    }
  } catch (err) {
    statusText.textContent = "sem sintonia · modo público";
    channelReadout.textContent = "canal: web · pública";
    actionLink.textContent = "→ entrar no motor";
  }
}

attemptHandshake();
