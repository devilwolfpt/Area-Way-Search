# Inovar — homepage estática (Netlify) + ponte com o browser

## O que é

O **Inovar** é um site de pesquisa que parece uma homepage normal, mas quando
aberto **dentro do browser Tauri** recebe uma credencial invisível injectada
pelo backend. Sem credencial, funciona como qualquer motor de busca público.
Com credencial, revela uma página de boas-vindas e passa as pesquisas para o
browser.

A password nunca é pedida visualmente — o browser insere-a por código.

## Como funciona

1. O browser Tauri abre a homepage (`index.html`) numa webview.
2. O backend Rust do Tauri detecta que a URL é a do Inovar e injecta
   `window.inovar` via `webview.eval()` — um objeto com `authenticate()` e
   `search()`. A credencial (token de sessão) nunca aparece no DOM, nunca
   viaja pela rede, nunca está no HTML estático.
3. O `app.js` chama `window.inovar.authenticate()`. Recebe `true` ou `false`.
4. Se `true`, marca `sessionStorage` e redireciona para `welcome.html`.
5. Quando o utilizador pesquisa, o site chama `window.inovar.search(query)`.
   O backend Rust recebe a query e executa a pesquisa no motor configurado.

Se a mesma página for aberta num browser normal (Chrome, Firefox, Safari),
`window.inovar` não existe — a página funciona como uma homepage de pesquisa
comum, sem dar qualquer indicação de que existe conteúdo escondido.

## Estrutura

```
/
  index.html       # homepage — sonar, pesquisa, handshake silencioso
  style.css
  app.js           # lógica de pesquisa + autenticação via window.inovar
  welcome.html     # página de boas-vindas (exibida após autenticação)
  welcome.css
  netlify.toml     # configuração de deploy Netlify
  package.json
```

No ecossistema Tauri, o backend Rust faz o papel do processo principal e da
ponte de comunicação: gera o token, injecta o `window.inovar` e processa as
pesquisas.

## Deploy no Netlify

1. Liga o repositório ao Netlify (ou faz drag-drop da pasta).
2 O `netlify.toml` já está configurado — não precisa de build step.
3. O site fica disponível em `https://<nome>.netlify.app`.

## Comunicação com o browser (Tauri)

Para o site funcionar com o browser Tauri, o backend Rust precisa de:

1. Gerar um token de sessão aleatório (`crypto::random_bytes` ou similar).
2. Quando a webview navegar para o domínio do Inovar, injectar:

```js
window.inovar = {
  authenticate: async () => {
    // Devolve true se o token de sessão corresponder ao que o
    // backend gerou para esta sessão. O token nunca está neste
    // objeto — está numa closure do lado Rust.
    // Podes usar postMessage, invoke, ou outro canal Tauri.
    return true; // ou false
  },
  search: (query) => {
    // Envia a query para o backend Rust, que a processa
    // (navega para o motor de pesquisa, abre separador, etc.)
  }
};
```

Exemplo concreto de injecção no Rust:

```rust
// No teu comando Tauri ou handler de navegação:
if url.contains("inovar") {
    let js = r#"
window.inovar = {
  authenticate: async () => true,
  search: (q) => {
    window.__TAURI_INTERNALS__.invoke('navigate_webview', {
      label: window.__inovar_label,
      url: 'https://www.google.com/search?q=' + encodeURIComponent(q),
    }).catch(() => {});
  }
};
window.__inovar_label = "..." // label da webview actual
"#;
    let _ = webview.eval(js);
}
```

## Desenvolvimento local

```bash
npx serve .
# abre http://localhost:3000
```

## Segurança (nota honesta)

A credencial é gerada em memória, injectada por código, e nunca aparece no
HTML ou na rede. Isto impede descoberta casual por inspecção de elementos ou
pela aba Network. No entanto, não é criptografia robusta contra alguém que
compile o próprio browser — isso exigiria assinatura de código e verificação
de integridade do processo, que estão fora do âmbito de uma homepage.
