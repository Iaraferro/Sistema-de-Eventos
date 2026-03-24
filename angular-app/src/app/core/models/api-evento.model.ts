export interface ApiEvento {
  id: number | null;
  nome: string | null;
  descricao: string | null;
  dataHora: string | null;
  local: string | null;
  arquivos: string[] | null;
}
