/* Entrada dos dois documentos do build (index.html e a página do Codex).
   A home entra por import estático porque é o destino da maioria das
   visitas; as demais páginas são lazy (app/routes.tsx). Ver
   `entradas/comum.tsx`. */
import "@/pages/Home";
import { montar } from "./entradas/comum";

montar();
