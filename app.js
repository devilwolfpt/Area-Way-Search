const statusText = document.getElementById("statusText");
const channelReadout = document.getElementById("channelReadout");
const actionLink = document.getElementById("actionLink");

const inShell = typeof window.inovar !== "undefined";

async function attemptHandshake() {
  if (!inShell) {
    statusText.textContent = "acesso restrito · terminal não reconhecido";
    channelReadout.textContent = "canal: bloqueado";
    actionLink.style.display = "none";
    document.querySelector(".ping").style.borderColor = "#ff3b30";
    return;
  }

  statusText.textContent = "a estabelecer sintonia…";
  channelReadout.textContent = "canal: ponte interna";

  try {
    const ok = await window.inovar.authenticate();

    if (ok) {
      statusText.textContent = "canal interno · sintonia confirmada";
      channelReadout.textContent = "ponte interna · segura";
      document.body.classList.add("authenticated");
      sessionStorage.setItem("inovar_authenticated", "true");
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 1400);
    } else {
      statusText.textContent = "acesso restrito · autenticação recusada";
      channelReadout.textContent = "canal: bloqueado";
      actionLink.style.display = "none";
    }
  } catch (err) {
    statusText.textContent = "acesso restrito · erro de ligação";
    channelReadout.textContent = "canal: bloqueado";
    actionLink.style.display = "none";
  }
}

attemptHandshake();
