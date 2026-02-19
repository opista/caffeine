export function showToast(message: string, type: "success" | "error" = "success") {
    // Remove existing toast if present
    const existing = document.getElementById("caffeine-toast-root");
    if (existing) existing.remove();

    const host = document.createElement("div");
    host.id = "caffeine-toast-root";
    Object.assign(host.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "2147483647", // Max z-index
        pointerEvents: "none", // Let clicks pass through
    });

    const shadow = host.attachShadow({ mode: "open" });
    const toast = document.createElement("div");
    
    // Inline styles to isolate from page CSS
    toast.textContent = message;
    Object.assign(toast.style, {
        background: type === "success" ? "#2ecc71" : "#e74c3c",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        opacity: "0",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        transform: "translateY(10px)",
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
