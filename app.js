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
    setStatus("modo livre · pesquisa direta", "web pública", false);
    return;
  }

  setStatus("a estabelecer sintonia…", "ponte interna", false);

  try {
    const ok = await window.inovar.authenticate();

    if (ok) {
      document.body.classList.add("authenticated");
      setStatus("sintonia confirmada", "ponte interna · segura", true);
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
    window.inovar.search(q);
  } else {
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
