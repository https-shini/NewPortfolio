import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGithubStats } from "./useGithubStats";

describe("useGithubStats", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("inicia com valores nulos (consumidor aplica fallback)", () => {
        vi.mocked(fetch).mockReturnValue(new Promise(() => {})); // pendente
        const { result } = renderHook(() => useGithubStats());
        expect(result.current).toEqual({ commits: null, repos: null });
    });

    it("popula e cacheia em caso de sucesso", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ commits: 1234, repos: 74 }),
        } as Response);

        const { result } = renderHook(() => useGithubStats());
        await waitFor(() => expect(result.current.commits).toBe(1234));
        expect(result.current.repos).toBe(74);
        expect(sessionStorage.getItem("github-stats")).toContain("1234");
    });

    it("mantém nulos (fallback) quando a chamada falha", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("rate limit"));
        const { result } = renderHook(() => useGithubStats());
        await waitFor(() => expect(fetch).toHaveBeenCalled());
        expect(result.current).toEqual({ commits: null, repos: null });
    });

    it("usa o cache de sessão sem refazer a chamada", () => {
        sessionStorage.setItem(
            "github-stats",
            JSON.stringify({ commits: 999, repos: 10 }),
        );
        const { result } = renderHook(() => useGithubStats());
        expect(result.current.commits).toBe(999);
        expect(fetch).not.toHaveBeenCalled();
    });
});
