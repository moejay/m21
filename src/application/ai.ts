import type { Concept, ConceptRevision } from "../domain/model.js";

export interface AiSuggestion {
  summary: string;
  changes: ConceptRevision;
}

export interface AiProvider {
  suggest(input: { instruction: string; focus: Concept; context: Concept[]; stage?: string }): Promise<AiSuggestion>;
}

export class DevelopmentAiProvider implements AiProvider {
  readonly name = "development";

  async suggest(input: { instruction: string; focus: Concept; stage?: string }): Promise<AiSuggestion> {
    const clarification = `\n\n# Clarification\n\n${input.instruction.trim()}`;
    return {
      summary: `Clarify ${input.focus.title}${input.stage ? ` during ${input.stage}` : ""}`,
      changes: { body: input.focus.body.trimEnd() + clarification + "\n" },
    };
  }
}

export interface OpenAiCompatibleConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name = "openai-compatible";

  constructor(private readonly config: OpenAiCompatibleConfig) {}

  async suggest(input: { instruction: string; focus: Concept; context: Concept[]; stage?: string }): Promise<AiSuggestion> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({
            instruction: input.instruction,
            definitionLayer: input.stage,
            focus: contextConcept(input.focus, 8_000),
            context: input.context
              .filter((concept) => concept.id !== input.focus.id)
              .slice(0, 12)
              .map((concept) => contextConcept(concept, 2_000)),
          }) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI provider failed with ${response.status}: ${await response.text()}`);
    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI provider returned no structured proposal");
    const parsed = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Record<string, unknown>;
    const summary = typeof parsed.summary === "string" ? parsed.summary : "Develop focused concept";
    const changes = parsed.changes;
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
      throw new Error("AI proposal must contain a changes object");
    }
    const candidate = changes as Record<string, unknown>;
    const revision: ConceptRevision = {};
    if (typeof candidate.title === "string") revision.title = candidate.title;
    if (typeof candidate.description === "string") revision.description = candidate.description;
    if (typeof candidate.body === "string") revision.body = candidate.body;
    if (Object.keys(revision).length === 0) throw new Error("AI proposal contains no supported concept changes");
    return { summary, changes: revision };
  }
}

function contextConcept(concept: Concept, bodyLimit: number) {
  return {
    id: concept.id,
    type: concept.type,
    title: concept.title,
    description: concept.description,
    status: concept.status,
    body: concept.body.slice(0, bodyLimit),
    relationships: concept.relationships,
  };
}

const SYSTEM_PROMPT = `You are the M21 product-engineering thought partner. Develop the focused OKF concept using only accepted context and the user's instruction.

Distinguish accepted knowledge from inference. Do not invent research, decisions, constraints, or evidence. Make the smallest coherent revision. The user must review it before persistence.

Return JSON only:
{
  "summary": "short proposal summary",
  "changes": {
    "title": "optional revised title",
    "description": "optional revised description",
    "body": "optional complete revised Markdown body"
  }
}

Include only fields that materially change. Preserve useful existing knowledge in any complete revised body.`;
