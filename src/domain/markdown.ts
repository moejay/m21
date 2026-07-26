export interface MermaidDiagramSource {
  index: number;
  source: string;
}

export function mermaidDiagrams(markdown: string): MermaidDiagramSource[] {
  const diagrams: MermaidDiagramSource[] = [];
  const pattern = /^(?:```|~~~)mermaid[ \t]*\r?\n([\s\S]*?)\r?\n(?:```|~~~)[ \t]*$/gim;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(markdown)) !== null) {
    diagrams.push({ index: match.index, source: match[1] ?? "" });
  }
  return diagrams;
}
