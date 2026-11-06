import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProfileWidgets } from "./ProfileWidgets";
import { LANG_KEY } from "@/shared/config/constants";

const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <Providers>
            <ProfileWidgets />
        </Providers>,
    );
};

describe("ProfileWidgets", () => {
    it("os quatro indicadores com as URLs exatas, lazy e com alt", () => {
        montar();
        const sec = screen.getByRole("region", {
            name: "Panorama do perfil no GitHub",
        });
        const imgs = within(sec).getAllByRole("img");
        expect(imgs.map((i) => i.getAttribute("src"))).toEqual([
            "https://gcruz-github-readme-stats.vercel.app/api?username=https-shini&show_icons=true&theme=radical&include_all_commits=true&count_private=true&hide_border=true&bg_color=0d1117&cache_seconds=86400&rank_icon=percentile",
            "https://gcruz-github-readme-stats.vercel.app/api/top-langs/?username=https-shini&layout=compact&langs_count=8&theme=radical&hide_border=true&bg_color=0d1117&cache_seconds=86400&card_width=380",
            "https://streak-stats.demolab.com/?user=https-shini&theme=radical&hide_border=true&background=0d1117",
            "https://github-profile-trophy-khaki-nine.vercel.app/?username=https-shini&theme=radical&no-frame=true&column=-1&margin-w=8&margin-h=8&row=2",
        ]);
        for (const img of imgs) {
            expect(img).toHaveAttribute("loading", "lazy");
            expect(img.getAttribute("alt")?.length).toBeGreaterThan(20);
        }
    });

    it("avisa que o GitHub Stats conta contribuições privadas", () => {
        montar();
        expect(
            screen.getByText(/contribuições em repositórios privados/),
        ).toBeInTheDocument();
    });

    it("falha de carregamento vira aviso com link para a fonte", () => {
        montar();
        const streak = screen.getByRole("img", {
            name: /sequência atual/,
        });
        fireEvent.error(streak);
        const aviso = screen.getByRole("status");
        expect(aviso).toHaveTextContent("Não foi possível carregar");
        expect(
            within(aviso).getByRole("link", { name: /Abrir no serviço/ }),
        ).toHaveAttribute(
            "href",
            "https://streak-stats.demolab.com/?user=https-shini&theme=radical&hide_border=true&background=0d1117",
        );
    });
});
