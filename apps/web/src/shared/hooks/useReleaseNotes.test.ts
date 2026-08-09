import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReleaseNotes } from "./useReleaseNotes";
import { writeCache } from "@/shared/lib/cache";

const RELEASES = [
    {
        version: "2.0.0",
        date: "2026-08-04T12:00:00Z",
        title: "v2.0.0",
        html: "<p>notas</p>",
        url: "https://github.com/x/y/releases/tag/v2.0.0",
    },
];

describe("useReleaseNotes", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("começa carregando e sem releases", () => {
        vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
        const { result } = renderHook(() => useReleaseNotes());

        expect(result.current.status).toBe("loading");
        expect(result.current.releases).toEqual([]);
    });

    it("popula e cacheia em caso de sucesso", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ releases: RELEASES }),
        } as Response);

        const { result } = renderHook(() => useReleaseNotes());

        await waitFor(() => expect(result.current.status).toBe("ok"));
        expect(result.current.releases).toEqual(RELEASES);
        expect(sessionStorage.getItem("release-notes")).toContain("2.0.0");
    });

    it("reaproveita o cache sem refazer a chamada", () => {
        writeCache("release-notes", RELEASES);
        const { result } = renderHook(() => useReleaseNotes());

        expect(result.current.status).toBe("ok");
        expect(result.current.releases).toEqual(RELEASES);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("ignora cache expirado", () => {
        vi.useFakeTimers();
        writeCache("release-notes", RELEASES);
        vi.setSystemTime(Date.now() + 1000 * 60 * 61);

        vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
        renderHook(() => useReleaseNotes());

        expect(fetch).toHaveBeenCalledWith("/api/release-notes");
    });

    it("marca erro quando a chamada falha", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("offline"));
        const { result } = renderHook(() => useReleaseNotes());

        await waitFor(() => expect(result.current.status).toBe("error"));
        /* Lista vazia: quem consome cai na camada local. */
        expect(result.current.releases).toEqual([]);
    });

    it("marca erro em resposta não-ok", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
        const { result } = renderHook(() => useReleaseNotes());

        await waitFor(() => expect(result.current.status).toBe("error"));
    });

    it("tolera corpo sem a chave releases", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);

        const { result } = renderHook(() => useReleaseNotes());

        await waitFor(() => expect(result.current.status).toBe("ok"));
        expect(result.current.releases).toEqual([]);
    });

    it("não busca quando desligado", () => {
        const { result } = renderHook(() =>
            useReleaseNotes({ enabled: false }),
        );

        expect(fetch).not.toHaveBeenCalled();
        expect(result.current.status).toBe("ok");
    });
});
