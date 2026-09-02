export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
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
