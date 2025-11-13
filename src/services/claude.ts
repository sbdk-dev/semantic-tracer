/**
 * Claude API Service
 *
 * Handles AI-powered diagram generation using Anthropic's Claude API.
 * Includes retry logic, error handling, and response parsing.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Node, Edge } from 'reactflow';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;

export interface DiagramStructure {
  nodes: Node[];
  edges: Edge[];
  explanation?: string;
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
}

// System prompt for legal entity diagram generation
const LEGAL_SYSTEM_PROMPT = `You are an M&A attorney's assistant specializing in corporate structures.

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no explanations):
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "corporation" | "llc" | "partnership" | "individual" | "trust" | "disregarded" | "foreign" | "asset",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Entity Name",
        "jurisdiction": "Delaware" | "Nevada" | "Cayman Islands" | etc.,
        "taxStatus": "us" | "foreign" | "passthrough",
        "notes": "Optional compliance notes"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "parent-id",
      "target": "child-id",
      "label": "100%",
      "data": {
        "ownershipType": "voting" | "economic" | "both",
        "votingPercentage": 100,
        "economicPercentage": 100
      }
    }
  ]
}

LEGAL CONVENTIONS TO FOLLOW:
1. Delaware is default jurisdiction for C-Corps
2. Ownership percentages must sum to 100% per entity
3. Foreign entities (non-US) use "foreign" type
4. Disregarded entities (single-member LLCs) use "disregarded" type
5. Note beneficial ownership >25% (FinCEN rule)
6. For preferred stock, note liquidation preference in notes
7. Show both voting and economic interest if different

COMMON STRUCTURES YOU SHOULD RECOGNIZE:
- Startup: Common shareholders + Preferred investors + Option Pool
- Holding Company: HoldCo (parent) → OpCo subsidiaries
- Real Estate: Property LLC → Management LLC
- Fund: GP + LP → Partnership → Portfolio Companies

VISUAL LAYOUT HINTS:
- Use hierarchical top-down layout (parents above children)
- Space nodes 150px horizontally, 100px vertically
- Group related entities (e.g., all subsidiaries at same level)

COMPLIANCE CONSIDERATIONS:
- Flag foreign ownership >25% for CFIUS review
- Note required filings (FinCEN beneficial ownership)
- Highlight potential tax issues (e.g., foreign LLC classification)`;

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY is not set. Please add it to your .env file.'
    );
  }

  return new Anthropic({ apiKey });
}

/**
 * Generate diagram from text description
 */
export async function generateDiagram(
  description: string,
  options: GenerationOptions = {}
): Promise<DiagramStructure> {
  const prompt = `Generate a legal entity diagram: ${description}`;
  return callClaudeAPI(prompt, options);
}

/**
 * Modify existing diagram based on user request
 */
export async function generateDiagramModification(params: {
  currentDiagram: DiagramStructure;
  action: string;
  focusNodeId?: string;
}): Promise<DiagramStructure> {
  const prompt = `
Current diagram:
${JSON.stringify(params.currentDiagram, null, 2)}

User action${params.focusNodeId ? ` on node ${params.focusNodeId}` : ''}:
${params.action}

Return the COMPLETE updated diagram with the requested modifications merged in.
Maintain all existing nodes unless explicitly replacing them.
  `.trim();

  return callClaudeAPI(prompt);
}

/**
 * Chat-based diagram modification
 */
export async function chatModifyDiagram(
  userMessage: string,
  context: {
    currentDiagram: DiagramStructure;
    conversationHistory: Array<{ role: string; content: string }>;
  }
): Promise<DiagramStructure> {
  const contextPrompt = `
Current diagram state:
${JSON.stringify(context.currentDiagram, null, 2)}

Previous conversation:
${context.conversationHistory
  .slice(-5) // Last 5 messages for context
  .map((m) => `${m.role}: ${m.content}`)
  .join('\n')}

User request: ${userMessage}

Return the updated diagram JSON with an "explanation" field describing what changed.
  `.trim();

  return callClaudeAPI(contextPrompt);
}

/**
 * Call Claude API with retry logic
 */
async function callClaudeAPI(
  prompt: string,
  options: GenerationOptions = {},
  retries = MAX_RETRIES
): Promise<DiagramStructure> {
  const anthropic = getAnthropicClient();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const message = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature,
        system: LEGAL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal as any }
    );

    clearTimeout(timeoutId);

    const firstContent = message.content[0];
    if (!firstContent || firstContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    const responseText = firstContent.text;
    return parseClaudeResponse(responseText);
  } catch (error: any) {
    if (retries > 0 && shouldRetry(error)) {
      console.warn(`API call failed, retrying... (${retries} left)`);
      await sleep(1000);
      return callClaudeAPI(prompt, options, retries - 1);
    }

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw new Error(`Claude API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Parse Claude response to extract diagram structure
 */
export function parseClaudeResponse(text: string): DiagramStructure {
  // Try direct JSON parse
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try extracting just {...} content
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch && objectMatch[0]) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not parse JSON from Claude response');
  }
}

/**
 * Validate diagram structure
 */
export function validateDiagramStructure(
  diagram: DiagramStructure
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check nodes
  if (!diagram.nodes || !Array.isArray(diagram.nodes)) {
    errors.push('Missing or invalid nodes array');
  } else {
    diagram.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`Node at index ${index} missing id`);
      }
      if (!node.type) {
        errors.push(`Node ${node.id} missing type`);
      }
      if (!node.data) {
        errors.push(`Node ${node.id} missing data`);
      }
    });
  }

  // Check edges
  if (!diagram.edges || !Array.isArray(diagram.edges)) {
    errors.push('Missing or invalid edges array');
  } else {
    diagram.edges.forEach((edge, index) => {
      if (!edge.id) {
        errors.push(`Edge at index ${index} missing id`);
      }
      if (!edge.source) {
        errors.push(`Edge ${edge.id} missing source`);
      }
      if (!edge.target) {
        errors.push(`Edge ${edge.id} missing target`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if error should trigger a retry
 */
function shouldRetry(error: any): boolean {
  // Retry on network errors, timeouts, and 5xx errors
  return (
    error.name === 'AbortError' ||
    error.message?.includes('network') ||
    error.status >= 500
  );
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate estimated cost for a generation
 */
export function estimateCost(tokens: {
  input: number;
  output: number;
}): number {
  // Claude Sonnet 4.5 pricing (as of 2025)
  const inputCostPer1M = 3.0;
  const outputCostPer1M = 15.0;

  const inputCost = (tokens.input / 1_000_000) * inputCostPer1M;
  const outputCost = (tokens.output / 1_000_000) * outputCostPer1M;

  return inputCost + outputCost;
}
