import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtualizacaoDesktop } from "./useAtualizacaoDesktop";
import type { EstadoAtualizacao } from "@/shared/lib/desktop";

/* ─────────────────────────────────────────────────────────
   useAtualizacaoDesktop
   ─────────────────────────────────────────────────────────
   O mesmo hook roda nos dois lugares. No navegador não existe ponte
   nenhuma, e ele precisa devolver um estado inerte em vez de quebrar —
   é o que permite a página montar o cartão sem se ramificar antes.
───────────────────────────────────────────────────────── */

/** Ponte falsa, com controle sobre o que o processo principal "diz". */
function pontefalsa(inicial: EstadoAtualizacao) {
    const ouvintes = new Set<(e: EstadoAtualizacao) => void>();
    const ponte = {
        ler: vi.fn(async () => inicial),
        verificar: vi.fn(async () => inicial),
        baixar: vi.fn(async () => inicial),
        instalar: vi.fn(),
        ouvir: vi.fn((cb: (e: EstadoAtualizacao) => void) => {
            ouvintes.add(cb);
            return () => ouvintes.delete(cb);
        }),
    };
    window.portfolioDesktop = {
        versao: "2.3.0",
        plataforma: "linux",
        atualizacao: ponte,
    };
    return {
        ponte,
        emitir: (e: EstadoAtualizacao) => ouvintes.forEach((o) => o(e)),
        ouvintes,
    };
}

afterEach(() => {
    delete window.portfolioDesktop;
});

describe("useAtualizacaoDesktop", () => {
    it("no navegador devolve indisponível, sem quebrar", () => {
        const { result } = renderHook(() => useAtualizacaoDesktop());
        expect(result.current.estado.situacao).toBe("indisponivel");
        /* As ações existem e não fazem nada: a página chama sem checar. */
        expect(() => result.current.verificar()).not.toThrow();
        expect(() => result.current.instalar()).not.toThrow();
    });

    it("lê o estado que já passou antes desta tela existir", async () => {
        /* A verificação começa quando o app abre. Quem navega até a
           página meio minuto depois perdeu os eventos — sem esta leitura
           uma atualização pronta apareceria como "nada por aqui". */
        const { ponte } = pontefalsa({ situacao: "pronta", nova: "2.4.0" });

        const { result } = renderHook(() => useAtualizacaoDesktop());

        await waitFor(() =>
            expect(result.current.estado.situacao).toBe("pronta"),
        );
        expect(result.current.estado.nova).toBe("2.4.0");
        expect(ponte.ler).toHaveBeenCalledOnce();
    });

    it("acompanha as mudanças que o processo principal emite", async () => {
        const { emitir } = pontefalsa({ situacao: "ocioso" });
        const { result } = renderHook(() => useAtualizacaoDesktop());
        await waitFor(() =>
            expect(result.current.estado.situacao).toBe("ocioso"),
        );

        act(() => emitir({ situacao: "baixando", progresso: 42 }));
        expect(result.current.estado.situacao).toBe("baixando");
        expect(result.current.estado.progresso).toBe(42);
    });

    it("cancela a inscrição ao desmontar", async () => {
        /* Sem isto cada navegação até a página empilharia um ouvinte no
           mesmo canal, e o React avisaria de atualização em componente
           desmontado. */
        const { ouvintes } = pontefalsa({ situacao: "atual" });
        const { unmount, result } = renderHook(() => useAtualizacaoDesktop());
        await waitFor(() =>
            expect(result.current.estado.situacao).toBe("atual"),
        );

        expect(ouvintes.size).toBe(1);
        unmount();
        expect(ouvintes.size).toBe(0);
    });

    it("uma ponte que falha ao ler não derruba a página", async () => {
        /* App antigo, sem este canal. */
        window.portfolioDesktop = {
            versao: "2.0.0",
            plataforma: "win32",
            atualizacao: {
                ler: vi.fn(async () => {
                    throw new Error("canal desconhecido");
                }),
                verificar: vi.fn(),
                baixar: vi.fn(),
                instalar: vi.fn(),
                ouvir: vi.fn(() => () => {}),
            } as never,
        };

        const { result } = renderHook(() => useAtualizacaoDesktop());
        await waitFor(() =>
            expect(result.current.estado.situacao).toBe("indisponivel"),
        );
    });

    it("as ações chegam à ponte", async () => {
        const { ponte } = pontefalsa({ situacao: "disponivel", nova: "2.4.0" });
        const { result } = renderHook(() => useAtualizacaoDesktop());
        await waitFor(() =>
            expect(result.current.estado.situacao).toBe("disponivel"),
        );

        act(() => result.current.baixar());
        expect(ponte.baixar).toHaveBeenCalledOnce();

        act(() => result.current.instalar());
        expect(ponte.instalar).toHaveBeenCalledOnce();
    });
});
