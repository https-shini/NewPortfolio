// @vitest-environment node

import { describe, it, expect } from "vitest";
import { capaDoReadme, escolherCapa } from "./_github-cover";

const ORIGEM = { owner: "https-shini", repo: "AuthService", ref: "main" };

describe("capaDoReadme", () => {
    it("ignora selos e cabeçalhos e pega o banner do repositório (caso real: AuthService)", () => {
        const md = [
            '<img width="100%" src="https://capsule-render.vercel.app/api?type=waving">',
            "[![Docs](https://img.shields.io/badge/API-Docs-009688)](https://x.dev)",
            '<img src="./read-model/img/Banner.png" alt="Banner">',
            '<img src="./read-model/img/Login01.png" alt="Login">',
        ].join("\n");
        expect(capaDoReadme(md, ORIGEM)).toBe(
            "https://raw.githubusercontent.com/https-shini/AuthService/main/read-model/img/Banner.png",
        );
    });

    it("README só com selos não tem capa (caso real: web-chat)", () => {
        const md =
            "[![Licença](https://img.shields.io/badge/Licença-MIT-green)](LICENSE) " +
            "[![Código](https://img.shields.io/badge/Ver-181717?logo=github)](https://github.com)";
        expect(capaDoReadme(md, ORIGEM)).toBeNull();
    });

    it("descarta botão, logo e ícone (caso real: btn-spotify.png)", () => {
        const md = [
            "![b](img/btn-spotify.png)",
            "![l](assets/logo.png)",
            "![i](icon_app.png)",
            "![t](img/tela-inicial.png)",
        ].join("\n");
        expect(capaDoReadme(md, ORIGEM)).toContain("tela-inicial.png");
        expect(capaDoReadme("![b](img/btn-spotify.png)", ORIGEM)).toBeNull();
    });

    it("prefere nome de capa entre as primeiras imagens", () => {
        const md = "![logo](docs/logo.png)\n![tela](docs/screenshot-home.png)";
        expect(capaDoReadme(md, ORIGEM)).toContain("screenshot-home.png");
    });

    it("converte github.com/blob para arquivo cru e aceita user-attachments", () => {
        expect(
            capaDoReadme(
                "![x](https://github.com/https-shini/a/blob/main/img/print.png?raw=true)",
                ORIGEM,
            ),
        ).toBe(
            "https://raw.githubusercontent.com/https-shini/a/main/img/print.png",
        );
        expect(
            capaDoReadme(
                "![x](https://github.com/user-attachments/assets/abc-123)",
                ORIGEM,
            ),
        ).toBe("https://github.com/user-attachments/assets/abc-123");
    });

    it("recusa SVG, http, javascript: e hosts fora do GitHub", () => {
        const md = [
            "![a](img/diagrama.svg)",
            "![b](http://raw.githubusercontent.com/x/y/main/a.png)",
            "![c](javascript:alert(1))",
            "![d](https://imgur.com/foto.png)",
        ].join("\n");
        expect(capaDoReadme(md, ORIGEM)).toBeNull();
    });
});

describe("escolherCapa", () => {
    it("social preview customizada vence o README", () => {
        expect(
            escolherCapa(
                {
                    usesCustomOpenGraphImage: true,
                    openGraphImageUrl:
                        "https://repository-images.githubusercontent.com/1/abc",
                    readme: "![b](banner.png)",
                },
                ORIGEM,
            ),
        ).toEqual({
            kind: "custom",
            url: "https://repository-images.githubusercontent.com/1/abc",
        });
    });

    it("card automático do GitHub não é capa: cai para o README, senão nada", () => {
        const auto = {
            usesCustomOpenGraphImage: false,
            openGraphImageUrl:
                "https://opengraph.githubassets.com/x/https-shini/a",
        };
        expect(
            escolherCapa({ ...auto, readme: "![b](banner.png)" }, ORIGEM)?.kind,
        ).toBe("readme");
        expect(escolherCapa({ ...auto, readme: null }, ORIGEM)).toBeNull();
    });
});
