export function announce(
    message: string,
    priority: "polite" | "assertive" = "polite",
): void {
    let region = document.getElementById("aria-live-region");
    if (!region) {
        region = document.createElement("div");
        region.id = "aria-live-region";
        region.setAttribute("aria-live", priority);
        region.setAttribute("aria-atomic", "true");
        region.className = "sr-only";
        document.body.appendChild(region);
    }
    region.textContent = "";
    requestAnimationFrame(() => {
        if (region) region.textContent = message;
    });
    setTimeout(() => {
        if (region) region.textContent = "";
    }, 2000);
}
