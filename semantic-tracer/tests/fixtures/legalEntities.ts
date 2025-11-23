/**
 * Legal Entity Test Fixtures
 *
 * Provides realistic legal entity structures for testing.
 * Based on common M&A and corporate law patterns.
 */

import type { Node, Edge } from 'reactflow';

export type EntityType =
  | 'corporation'
  | 'llc'
  | 'partnership'
  | 'individual'
  | 'trust'
  | 'disregarded'
  | 'foreign'
  | 'asset';

export interface EntityNodeData {
  label: string;
  jurisdiction?: string;
  taxStatus?: 'us' | 'foreign' | 'passthrough';
  ownershipPercentage?: number;
  notes?: string;
}

export interface OwnershipEdgeData {
  ownershipType?: 'voting' | 'economic' | 'both';
  votingPercentage?: number;
  economicPercentage?: number;
}

// Simple Single Entity
export const singleCorporation: Node<EntityNodeData>[] = [
  {
    id: 'corp-1',
    type: 'corporation',
    position: { x: 250, y: 100 },
    data: {
      label: 'Acme Corp',
      jurisdiction: 'Delaware',
      taxStatus: 'us',
    },
  },
];

// Holding Company Structure (HoldCo → 2 OpCos)
export const holdingCompanyStructure = {
  nodes: [
    {
      id: 'holdco-1',
      type: 'corporation',
      position: { x: 250, y: 0 },
      data: {
        label: 'HoldCo Inc.',
        jurisdiction: 'Delaware',
        taxStatus: 'us',
        notes: 'Parent holding company',
      },
    },
    {
      id: 'opco-1',
      type: 'llc',
      position: { x: 100, y: 200 },
      data: {
        label: 'OpCo 1 LLC',
        jurisdiction: 'Texas',
        taxStatus: 'passthrough',
        notes: 'Operating subsidiary',
      },
    },
    {
      id: 'opco-2',
      type: 'llc',
      position: { x: 400, y: 200 },
      data: {
        label: 'OpCo 2 LLC',
        jurisdiction: 'California',
        taxStatus: 'passthrough',
        notes: 'Operating subsidiary',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-holdco-opco1',
      source: 'holdco-1',
      target: 'opco-1',
      label: '80%',
      data: {
        ownershipType: 'both',
        votingPercentage: 80,
        economicPercentage: 80,
      },
    },
    {
      id: 'e-holdco-opco2',
      source: 'holdco-1',
      target: 'opco-2',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Startup Equity Structure (Common + Preferred + Options)
export const startupEquityStructure = {
  nodes: [
    {
      id: 'startup-1',
      type: 'corporation',
      position: { x: 400, y: 300 },
      data: {
        label: 'TechStartup Inc.',
        jurisdiction: 'Delaware',
        taxStatus: 'us',
        notes: 'C-Corp with equity split',
      },
    },
    {
      id: 'founder-1',
      type: 'individual',
      position: { x: 100, y: 100 },
      data: {
        label: 'Jane Founder',
        notes: 'CEO, Common stock',
      },
    },
    {
      id: 'founder-2',
      type: 'individual',
      position: { x: 300, y: 100 },
      data: {
        label: 'John Cofounder',
        notes: 'CTO, Common stock',
      },
    },
    {
      id: 'investor-1',
      type: 'corporation',
      position: { x: 500, y: 100 },
      data: {
        label: 'VC Fund I LP',
        jurisdiction: 'Delaware',
        taxStatus: 'us',
        notes: 'Series A Preferred',
      },
    },
    {
      id: 'options-pool',
      type: 'asset',
      position: { x: 700, y: 100 },
      data: {
        label: 'Option Pool',
        notes: 'Employee stock options',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-founder1-startup',
      source: 'founder-1',
      target: 'startup-1',
      label: '35%',
      data: {
        ownershipType: 'both',
        votingPercentage: 35,
        economicPercentage: 35,
      },
    },
    {
      id: 'e-founder2-startup',
      source: 'founder-2',
      target: 'startup-1',
      label: '30%',
      data: {
        ownershipType: 'both',
        votingPercentage: 30,
        economicPercentage: 30,
      },
    },
    {
      id: 'e-investor-startup',
      source: 'investor-1',
      target: 'startup-1',
      label: '20%',
      data: {
        ownershipType: 'economic',
        votingPercentage: 0,
        economicPercentage: 20,
      },
    },
    {
      id: 'e-options-startup',
      source: 'options-pool',
      target: 'startup-1',
      label: '15%',
      data: {
        ownershipType: 'economic',
        votingPercentage: 0,
        economicPercentage: 15,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Foreign Entity Structure (Cayman Islands holding US entities)
export const foreignEntityStructure = {
  nodes: [
    {
      id: 'foreign-holdco',
      type: 'foreign',
      position: { x: 300, y: 0 },
      data: {
        label: 'Global Holdings Ltd',
        jurisdiction: 'Cayman Islands',
        taxStatus: 'foreign',
        notes: 'Offshore holding company',
      },
    },
    {
      id: 'us-sub-1',
      type: 'corporation',
      position: { x: 150, y: 200 },
      data: {
        label: 'US Sub Inc.',
        jurisdiction: 'Delaware',
        taxStatus: 'us',
        notes: 'US operating entity',
      },
    },
    {
      id: 'us-sub-2',
      type: 'llc',
      position: { x: 450, y: 200 },
      data: {
        label: 'US Services LLC',
        jurisdiction: 'New York',
        taxStatus: 'us',
        notes: 'US services entity',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-foreign-ussub1',
      source: 'foreign-holdco',
      target: 'us-sub-1',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
    {
      id: 'e-foreign-ussub2',
      source: 'foreign-holdco',
      target: 'us-sub-2',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Disregarded Entity (Single-member LLC)
export const disregardedEntityStructure = {
  nodes: [
    {
      id: 'owner-corp',
      type: 'corporation',
      position: { x: 250, y: 0 },
      data: {
        label: 'Parent Corp',
        jurisdiction: 'Delaware',
        taxStatus: 'us',
      },
    },
    {
      id: 'disregarded-llc',
      type: 'disregarded',
      position: { x: 250, y: 150 },
      data: {
        label: 'Subsidiary LLC',
        jurisdiction: 'Delaware',
        taxStatus: 'passthrough',
        notes: 'Single-member LLC (disregarded entity)',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-corp-disregarded',
      source: 'owner-corp',
      target: 'disregarded-llc',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Real Estate Structure (Property LLC → Management LLC)
export const realEstateStructure = {
  nodes: [
    {
      id: 'property-llc',
      type: 'llc',
      position: { x: 250, y: 200 },
      data: {
        label: 'Property Holdings LLC',
        jurisdiction: 'Texas',
        taxStatus: 'passthrough',
        notes: 'Owns commercial real estate',
      },
    },
    {
      id: 'management-llc',
      type: 'llc',
      position: { x: 250, y: 0 },
      data: {
        label: 'Management Co LLC',
        jurisdiction: 'Texas',
        taxStatus: 'passthrough',
        notes: 'Manages property operations',
      },
    },
    {
      id: 'property-asset',
      type: 'asset',
      position: { x: 250, y: 350 },
      data: {
        label: 'Office Building',
        notes: '123 Main Street, Dallas TX',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-mgmt-property',
      source: 'management-llc',
      target: 'property-llc',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
    {
      id: 'e-property-asset',
      source: 'property-llc',
      target: 'property-asset',
      label: 'Owns',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Partnership Structure (GP + LPs)
export const partnershipStructure = {
  nodes: [
    {
      id: 'partnership',
      type: 'partnership',
      position: { x: 300, y: 200 },
      data: {
        label: 'Investment Fund LP',
        jurisdiction: 'Delaware',
        taxStatus: 'passthrough',
        notes: 'Limited partnership',
      },
    },
    {
      id: 'gp',
      type: 'llc',
      position: { x: 150, y: 0 },
      data: {
        label: 'GP LLC',
        jurisdiction: 'Delaware',
        taxStatus: 'passthrough',
        notes: 'General partner (1% ownership, full control)',
      },
    },
    {
      id: 'lp-1',
      type: 'individual',
      position: { x: 300, y: 0 },
      data: {
        label: 'Investor A',
        notes: 'Limited partner',
      },
    },
    {
      id: 'lp-2',
      type: 'individual',
      position: { x: 450, y: 0 },
      data: {
        label: 'Investor B',
        notes: 'Limited partner',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-gp-partnership',
      source: 'gp',
      target: 'partnership',
      label: '1% / 20% carry',
      data: {
        ownershipType: 'voting',
        votingPercentage: 100,
        economicPercentage: 1,
      },
    },
    {
      id: 'e-lp1-partnership',
      source: 'lp-1',
      target: 'partnership',
      label: '50%',
      data: {
        ownershipType: 'economic',
        votingPercentage: 0,
        economicPercentage: 50,
      },
    },
    {
      id: 'e-lp2-partnership',
      source: 'lp-2',
      target: 'partnership',
      label: '49%',
      data: {
        ownershipType: 'economic',
        votingPercentage: 0,
        economicPercentage: 49,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Trust Structure
export const trustStructure = {
  nodes: [
    {
      id: 'trust',
      type: 'trust',
      position: { x: 250, y: 0 },
      data: {
        label: 'Family Trust 2024',
        jurisdiction: 'Nevada',
        notes: 'Irrevocable trust',
      },
    },
    {
      id: 'trust-holdco',
      type: 'llc',
      position: { x: 250, y: 150 },
      data: {
        label: 'Trust Holdings LLC',
        jurisdiction: 'Nevada',
        taxStatus: 'passthrough',
        notes: 'Owned by trust',
      },
    },
  ] as Node<EntityNodeData>[],
  edges: [
    {
      id: 'e-trust-holdco',
      source: 'trust',
      target: 'trust-holdco',
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      },
    },
  ] as Edge<OwnershipEdgeData>[],
};

// Complex Multi-Tier Structure (50+ nodes stress test)
export const complexMultiTierStructure = {
  nodes: [
    // Top-level holding company
    {
      id: 'ultimate-parent',
      type: 'foreign',
      position: { x: 500, y: 0 },
      data: {
        label: 'Global Ultimate Parent Ltd',
        jurisdiction: 'Cayman Islands',
        taxStatus: 'foreign',
      },
    },
    // Regional holding companies
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `regional-holdco-${i}`,
      type: 'corporation',
      position: { x: 200 + i * 300, y: 150 },
      data: {
        label: `Regional HoldCo ${i + 1}`,
        jurisdiction: ['Delaware', 'UK', 'Singapore'][i],
        taxStatus: i === 0 ? 'us' : 'foreign',
      } as EntityNodeData,
    })),
    // Operating subsidiaries (5 per regional holdco)
    ...Array.from({ length: 15 }, (_, i) => {
      const regional = Math.floor(i / 5);
      return {
        id: `opco-${i}`,
        type: i % 3 === 0 ? 'corporation' : 'llc',
        position: { x: 100 + (i % 5) * 180, y: 300 + regional * 200 },
        data: {
          label: `OpCo ${i + 1}`,
          jurisdiction: 'Various',
          taxStatus: 'us',
        } as EntityNodeData,
      };
    }),
    // Sub-subsidiaries (2 per operating entity)
    ...Array.from({ length: 30 }, (_, i) => ({
      id: `sub-sub-${i}`,
      type: i % 2 === 0 ? 'llc' : 'disregarded',
      position: { x: 50 + (i % 10) * 100, y: 700 + Math.floor(i / 10) * 150 },
      data: {
        label: `Sub-Sub ${i + 1}`,
        jurisdiction: 'Various',
        taxStatus: 'passthrough',
      } as EntityNodeData,
    })),
  ] as Node<EntityNodeData>[],
  edges: [
    // Ultimate parent to regional
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `e-ultimate-regional-${i}`,
      source: 'ultimate-parent',
      target: `regional-holdco-${i}`,
      label: '100%',
      data: {
        ownershipType: 'both',
        votingPercentage: 100,
        economicPercentage: 100,
      } as OwnershipEdgeData,
    })),
    // Regional to operating
    ...Array.from({ length: 15 }, (_, i) => {
      const regional = Math.floor(i / 5);
      return {
        id: `e-regional-opco-${i}`,
        source: `regional-holdco-${regional}`,
        target: `opco-${i}`,
        label: '100%',
        data: {
          ownershipType: 'both',
          votingPercentage: 100,
          economicPercentage: 100,
        } as OwnershipEdgeData,
      };
    }),
    // Operating to sub-subs
    ...Array.from({ length: 30 }, (_, i) => {
      const opco = Math.floor(i / 2);
      return {
        id: `e-opco-subsub-${i}`,
        source: `opco-${opco}`,
        target: `sub-sub-${i}`,
        label: '100%',
        data: {
          ownershipType: 'both',
          votingPercentage: 100,
          economicPercentage: 100,
        } as OwnershipEdgeData,
      };
    }),
  ] as Edge<OwnershipEdgeData>[],
};

// All fixtures for easy import
export const legalEntityFixtures = {
  singleCorporation,
  holdingCompanyStructure,
  startupEquityStructure,
  foreignEntityStructure,
  disregardedEntityStructure,
  realEstateStructure,
  partnershipStructure,
  trustStructure,
  complexMultiTierStructure,
};

// Helper functions for tests
export function createMockNode(
  id: string,
  type: EntityType,
  overrides?: Partial<Node<EntityNodeData>>
): Node<EntityNodeData> {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label: `Test ${type}`,
      jurisdiction: 'Delaware',
      taxStatus: 'us',
    },
    ...overrides,
  };
}

export function createMockEdge(
  source: string,
  target: string,
  overrides?: Partial<Edge<OwnershipEdgeData>>
): Edge<OwnershipEdgeData> {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    label: '100%',
    data: {
      ownershipType: 'both',
      votingPercentage: 100,
      economicPercentage: 100,
    },
    ...overrides,
  };
}

export function validateOwnershipPercentages(edges: Edge<OwnershipEdgeData>[], targetId: string): boolean {
  const incomingEdges = edges.filter(e => e.target === targetId);
  const total = incomingEdges.reduce((sum, edge) => {
    return sum + (edge.data?.economicPercentage || 0);
  }, 0);

  // Allow small rounding errors
  return Math.abs(total - 100) < 0.01 || incomingEdges.length === 0;
}
