export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// Los RSS suelen traer el resumen con HTML adentro (<p>, <img>, entidades...).
// Lo pasamos por el parser del navegador para quedarnos solo con el texto.
export function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function truncate(text, maxLength = 220) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function render(container, html) {
  container.innerHTML = html;
}

// Delegación de eventos: evita tener que re-atar listeners cada vez que se re-renderiza.
export function on(root, selector, eventName, handler) {
  root.addEventListener(eventName, (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) handler(event, target);
  });
}
