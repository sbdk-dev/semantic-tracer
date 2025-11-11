/**
 * Claude API Response Fixtures
 *
 * Mock responses for testing Claude integration without API calls.
 */

export const mockClaudeGenerationResponse = {
  valid: {
    simple: {
      id: 'msg_01ABC123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            nodes: [
              {
                id: 'corp-1',
                type: 'corporation',
                position: { x: 250, y: 100 },
                data: {
                  label: 'Acme Inc.',
                  jurisdiction: 'Delaware',
                  taxStatus: 'us',
                },
              },
            ],
            edges: [],
          }),
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 150,
        output_tokens: 85,
      },
    },
    withMarkdown: {
      id: 'msg_01XYZ789',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: `Here's your legal entity diagram:

\`\`\`json
{
  "nodes": [
    {
      "id": "holdco-1",
      "type": "corporation",
      "position": { "x": 250, "y": 0 },
      "data": {
        "label": "HoldCo Inc.",
        "jurisdiction": "Delaware",
        "taxStatus": "us"
      }
    },
    {
      "id": "opco-1",
      "type": "llc",
      "position": { "x": 250, "y": 150 },
      "data": {
        "label": "OpCo LLC",
        "jurisdiction": "Texas",
        "taxStatus": "passthrough"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "holdco-1",
      "target": "opco-1",
      "label": "100%",
      "data": {
        "ownershipType": "both",
        "votingPercentage": 100,
        "economicPercentage": 100
      }
    }
  ]
}
\`\`\`

This structure shows a Delaware holding company owning a Texas LLC.`,
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 200,
        output_tokens: 250,
      },
    },
    complexStructure: {
      id: 'msg_01COMPLEX',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            nodes: [
              {
                id: 'startup',
                type: 'corporation',
                position: { x: 300, y: 300 },
                data: {
                  label: 'TechCo Inc.',
                  jurisdiction: 'Delaware',
                  taxStatus: 'us',
                },
              },
              {
                id: 'founder1',
                type: 'individual',
                position: { x: 100, y: 100 },
                data: { label: 'Jane Founder' },
              },
              {
                id: 'founder2',
                type: 'individual',
                position: { x: 300, y: 100 },
                data: { label: 'John Cofounder' },
              },
              {
                id: 'vc',
                type: 'corporation',
                position: { x: 500, y: 100 },
                data: {
                  label: 'VC Fund LP',
                  jurisdiction: 'Delaware',
                },
              },
            ],
            edges: [
              {
                id: 'e1',
                source: 'founder1',
                target: 'startup',
                label: '40%',
                data: {
                  ownershipType: 'both',
                  votingPercentage: 40,
                  economicPercentage: 40,
                },
              },
              {
                id: 'e2',
                source: 'founder2',
                target: 'startup',
                label: '35%',
                data: {
                  ownershipType: 'both',
                  votingPercentage: 35,
                  economicPercentage: 35,
                },
              },
              {
                id: 'e3',
                source: 'vc',
                target: 'startup',
                label: '25%',
                data: {
                  ownershipType: 'both',
                  votingPercentage: 25,
                  economicPercentage: 25,
                },
              },
            ],
          }),
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 300,
        output_tokens: 450,
      },
    },
  },
  invalid: {
    malformedJson: {
      id: 'msg_01BAD',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: '{ "nodes": [ invalid json here',
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
      },
    },
    missingFields: {
      id: 'msg_01MISSING',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            nodes: [
              {
                id: 'node1',
                // Missing type and position
                data: { label: 'Test' },
              },
            ],
          }),
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 100,
        output_tokens: 50,
      },
    },
    textResponse: {
      id: 'msg_01TEXT',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: "I'll help you create a diagram, but I need more information about the structure you want to create.",
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 100,
        output_tokens: 30,
      },
    },
  },
  errors: {
    apiError: {
      error: {
        type: 'api_error',
        message: 'Service temporarily unavailable',
      },
    },
    authError: {
      error: {
        type: 'authentication_error',
        message: 'Invalid API key',
      },
    },
    rateLimitError: {
      error: {
        type: 'rate_limit_error',
        message: 'Rate limit exceeded',
      },
    },
    timeout: {
      error: {
        type: 'timeout',
        message: 'Request timeout',
      },
    },
  },
};

// Streaming response simulation
export const mockStreamingChunks = {
  simpleStructure: [
    { type: 'content_block_start', index: 0 },
    { type: 'content_block_delta', delta: { text: '{' } },
    { type: 'content_block_delta', delta: { text: '\n  "nodes": [' } },
    {
      type: 'content_block_delta',
      delta: {
        text: '\n    {\n      "id": "corp1",\n      "type": "corporation",',
      },
    },
    {
      type: 'content_block_delta',
      delta: {
        text: '\n      "position": { "x": 250, "y": 100 },',
      },
    },
    {
      type: 'content_block_delta',
      delta: {
        text: '\n      "data": { "label": "Test Corp", "jurisdiction": "Delaware" }',
      },
    },
    { type: 'content_block_delta', delta: { text: '\n    }' } },
    { type: 'content_block_delta', delta: { text: '\n  ],\n  "edges": []' } },
    { type: 'content_block_delta', delta: { text: '\n}' } },
    { type: 'content_block_stop' },
    {
      type: 'message_delta',
      delta: { stop_reason: 'end_turn' },
      usage: { output_tokens: 85 },
    },
  ],
};

// Mock modification responses (for chat/contextual actions)
export const mockModificationResponse = {
  addShareholders: {
    id: 'msg_01MOD',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          nodes: [
            {
              id: 'corp-1',
              type: 'corporation',
              position: { x: 300, y: 200 },
              data: { label: 'Acme Inc.', jurisdiction: 'Delaware' },
            },
            {
              id: 'shareholder-1',
              type: 'individual',
              position: { x: 150, y: 50 },
              data: { label: 'Shareholder A' },
            },
            {
              id: 'shareholder-2',
              type: 'individual',
              position: { x: 450, y: 50 },
              data: { label: 'Shareholder B' },
            },
          ],
          edges: [
            {
              id: 'e1',
              source: 'shareholder-1',
              target: 'corp-1',
              label: '60%',
              data: { ownershipType: 'both', votingPercentage: 60, economicPercentage: 60 },
            },
            {
              id: 'e2',
              source: 'shareholder-2',
              target: 'corp-1',
              label: '40%',
              data: { ownershipType: 'both', votingPercentage: 40, economicPercentage: 40 },
            },
          ],
          explanation: 'Added two shareholders with 60/40 ownership split',
        }),
      },
    ],
    model: 'claude-sonnet-4-20250514',
    stop_reason: 'end_turn',
    usage: { input_tokens: 250, output_tokens: 200 },
  },
};

// Helper to create mock Anthropic client
export function createMockAnthropicClient(scenario: 'success' | 'error' | 'timeout' = 'success') {
  return {
    messages: {
      create: vi.fn(async () => {
        if (scenario === 'timeout') {
          await new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          );
        }
        if (scenario === 'error') {
          throw mockClaudeGenerationResponse.errors.apiError;
        }
        return mockClaudeGenerationResponse.valid.simple;
      }),
      stream: vi.fn(async function* () {
        if (scenario === 'error') {
          throw mockClaudeGenerationResponse.errors.apiError;
        }
        for (const chunk of mockStreamingChunks.simpleStructure) {
          yield chunk;
        }
      }),
    },
  };
}
