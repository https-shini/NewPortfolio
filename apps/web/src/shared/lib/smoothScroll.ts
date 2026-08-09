export function scrollToSection(id: string): void {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
        once: true,
    });
}
