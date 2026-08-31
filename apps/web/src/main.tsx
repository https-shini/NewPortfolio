/* Documento da home — e destino de qualquer rota desconhecida. O import
   estático da página é o que a prende ao grafo deste documento; ver
   `entradas/comum.tsx` para o porquê de haver uma entrada por rota. */
import "@/pages/Home";
import { montar } from "./entradas/comum";

montar();
