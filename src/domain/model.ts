export type ConceptStatus = "draft" | "active" | "superseded" | "retired" | string;
export type ChangeKind = "editorial" | "internal" | "contract" | "structural";

export interface TypedRelationship {
  type: string;
  target: string;
  rationale?: string;
  evidence?: string[];
}

export interface Concept {
  id: string;
  filePath: string;
  type: string;
  title: string;
  description: string;
  body: string;
  status?: ConceptStatus;
  tags: string[];
  owners: string[];
  sdlc: string[];
  relationships: TypedRelationship[];
  metadata: Record<string, unknown>;
}

export interface GraphEdge extends TypedRelationship {
  source: string;
  targetId: string;
}

export type DiagnosticSeverity = "error" | "warning" | "risk" | "question";

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  conceptIds: string[];
  evidence?: string;
}

export interface ProjectSnapshot {
  root: string;
  name: string;
  revision: string;
  concepts: Concept[];
  edges: GraphEdge[];
  diagnostics: Diagnostic[];
}

export interface ConceptRevision {
  title?: string;
  description?: string;
  body?: string;
  status?: ConceptStatus;
  relationships?: TypedRelationship[];
  design?: Record<string, unknown>;
}

export interface ReviseConceptOperation {
  type: "revise-concept";
  conceptId: string;
  changes: ConceptRevision;
  changeKind: ChangeKind;
}

export type GraphOperation = ReviseConceptOperation;

export interface ImpactFinding {
  conceptId: string;
  changedConceptId: string;
  relationshipType: string;
  path: string[];
  reason: string;
  confidence: "definite" | "likely" | "possible";
  status: "unresolved" | "unaffected" | "updated" | "accepted-risk";
}

export interface ChangeProposal {
  id: string;
  baseRevision: string;
  summary: string;
  provenance: "user" | "ai";
  operations: GraphOperation[];
  impact: ImpactFinding[];
  status: "proposed" | "accepted" | "rejected";
}

export function relationshipTargetId(target: string): string {
  return target.replace(/^\//, "").replace(/\.md$/, "");
}
