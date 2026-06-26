/**
 * app.js — lógica da página inicial do Inovar
 *
 * A página nunca pede uma password visualmente. Em vez disso, quando é
 * aberta DENTRO do browser Tauri, o backend do browser injeta um objeto
 * `window.inovar` no momento do carregamento. Esse objeto contém:
 *
 *   authenticate() → Promise<true|false>
 *     Verifica silenciosamente se o browser reconhece esta sessão.
 *     A credencial (token/password) nunca aparece no DOM, nunca é
 *     escrita no HTML e nunca viaja pela rede.
 *
 *   search(query)  → void
 *     Envia a pesquisa ao browser, que a executa no motor configurado.
 *
 * Se a página for aberta num browser normal (fora do Tauri),
 * `window.inovar` simplesmente não existe — a página funciona como uma
 * homepage de pesquisa normal, sem revelar que existia algo escondido.
 */

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const channelReadout = document.getElementById("channelReadout");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

const inShell = typeof window.inovar !== "undefined";

function setStatus(label, channelLabel, live) {
  statusText.textContent = label;
  channelReadout.textContent = `canal: ${channelLabel}`;
  statusDot.classList.toggle("live", live);
}

async function attemptHandshake() {
  if (!inShell) {
    // Fora do browser Inovar (Tauri): nada de credenciais, nada a verificar.
    setStatus("modo livre · pesquisa direta", "web pública", false);
    return;
  }

  setStatus("a estabelecer sintonia…", "ponte interna", false);

  try {
    // window.inovar.authenticate() é injetado pelo browser Tauri.
    // Resolve com true/false. A credencial em si nunca passa por aqui.
    const ok = await window.inovar.authenticate();

    if (ok) {
      document.body.classList.add("authenticated");
      setStatus("sintonia confirmada", "ponte interna · segura", true);
      // Marca sessão para a welcome page poder confirmar
      sessionStorage.setItem("inovar_authenticated", "true");
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 650);
    } else {
      setStatus("sem sintonia · pesquisa direta", "ponte interna · inativa", false);
    }
  } catch (err) {
    setStatus("sem sintonia · pesquisa direta", "ponte interna · erro", false);
  }
}

function runSearch(query) {
  const q = query.trim();
  if (!q) return;

  if (inShell) {
    // O browser Tauri é quem decide o que fazer com a pesquisa
    // (abrir separador, usar o motor configurado, etc.)
    window.inovar.search(q);
  } else {
    // Fallback fora do shell: comporta-se como uma homepage normal
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(searchInput.value);
});

suggestions.addEventListener("click", (e) => {
  const btn = e.target.closest(".freq");
  if (!btn) return;
  searchInput.value = btn.dataset.q;
  runSearch(btn.dataset.q);
});

attemptHandshake();
