const coffeeCup = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-coffee"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" /><path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" /><path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" /><path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5" /><path d="M16.746 16.726a3 3 0 1 0 .252 -5.555" /></svg>`;

export function showToast(message: string, type: "success" | "error" = "success") {
  // Remove existing toast if present
  const existing = document.getElementById("caffeine-toast-root");
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = "caffeine-toast-root";
  Object.assign(host.style, {
    bottom: "20px",
    left: "20px",
    pointerEvents: "none", // Let clicks pass through
    position: "fixed",
    right: "20px",
    zIndex: "2147483647", // Max z-index
  });

  const shadow = host.attachShadow({ mode: "open" });
  const toast = document.createElement("div");

  // Inline styles to isolate from page CSS
  toast.textContent = message;
  Object.assign(toast.style, {
    background: type === "success" ? "#2ecc71" : "#e74c3c",
    borderRadius: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    opacity: "0",
    padding: "12px 24px",
    transform: "translateY(10px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    whiteSpace: "nowrap",
  });

  shadow.appendChild(toast);
  document.body.appendChild(host);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => host.remove(), 300);
  }, 3000);
}
