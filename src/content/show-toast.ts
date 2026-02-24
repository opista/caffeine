const coffeeCup = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" /><path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" /><path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" /><path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5" /><path d="M16.746 16.726a3 3 0 1 0 .252 -5.555" /></svg>`;
const alertCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>`;

export function showToast(message: string, type: "success" | "error" = "success") {
  // Remove existing toast if present
  const existing = document.getElementById("caffeine-toast-root");
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = "caffeine-toast-root";
  Object.assign(host.style, {
    bottom: "24px",
    left: "0",
    pointerEvents: "none",
    position: "fixed",
    right: "0",
    zIndex: "2147483647",
    display: "flex",
    justifyContent: "center",
  });

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .toast {
      display: flex;
      align-items: center;
      gap: 16px;
      background: ${type === "success" ? "#fff" : "#fef2f2"};
      border: 1px solid ${type === "success" ? "#f1f5f9" : "#fee2e2"};
      border-radius: 24px;
      padding: 12px 24px 12px 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
      color: ${type === "success" ? "#1e293b" : "#991b1b"};
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 700;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      pointer-events: auto;
    }
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: ${type === "success" ? "#6366f1" : "#fee2e2"};
      color: ${type === "success" ? "#fff" : "#ef4444"};
      flex-shrink: 0;
    }
    .icon svg {
      width: 24px;
      height: 24px;
    }
  `;
  shadow.appendChild(style);

  const toast = document.createElement("div");
  toast.className = "toast";

  const iconContainer = document.createElement("div");
  iconContainer.className = "icon";
  iconContainer.innerHTML = type === "success" ? coffeeCup : alertCircle;

  const text = document.createElement("span");
  text.textContent = message;

  toast.appendChild(iconContainer);
  toast.appendChild(text);

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
    toast.style.transform = "translateY(16px)";
    setTimeout(() => host.remove(), 400);
  }, 3000);
}
