import { Node, Edge } from 'reactflow';

export type EntityType =
  | 'corporation'
  | 'llc'
  | 'partnership'
  | 'individual'
  | 'trust'
  | 'disregarded'
  | 'foreign'
  | 'asset';

export type Jurisdiction =
  | 'Delaware'
  | 'Nevada'
  | 'Cayman Islands'
  | 'Texas'
  | 'California'
  | 'New York'
  | 'Florida'
  | string;

export type TaxStatus = 'us' | 'foreign' | 'passthrough';

export type OwnershipType = 'voting' | 'economic' | 'both';

export interface EntityData {
  label: string;
  jurisdiction: Jurisdiction;
  taxStatus: TaxStatus;
  notes?: string;
  type: EntityType;
}

export interface OwnershipData {
  ownershipType: OwnershipType;
  votingPercentage: number;
  economicPercentage: number;
}

export type EntityNode = Node<EntityData>;
export type OwnershipEdge = Edge<OwnershipData>;

export interface DiagramStructure {
  nodes: EntityNode[];
  edges: OwnershipEdge[];
  explanation?: string;
}

export interface EntityStyle {
  shape: 'rectangle' | 'rounded' | 'ellipse' | 'diamond' | 'hexagon' | 'triangle';
  borderStyle: 'solid' | 'dashed';
  fillColor: string;
  borderColor: string;
  borderWidth: number;
}

export const ENTITY_STYLES: Record<EntityType, EntityStyle> = {
  corporation: {
    shape: 'rectangle',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  llc: {
    shape: 'rounded',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  partnership: {
    shape: 'triangle',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  individual: {
    shape: 'ellipse',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  trust: {
    shape: 'diamond',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  disregarded: {
    shape: 'rectangle',
    borderStyle: 'dashed',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  foreign: {
    shape: 'rectangle',
    borderStyle: 'solid',
    fillColor: '#E3F2FD',
    borderColor: '#000000',
    borderWidth: 2,
  },
  asset: {
    shape: 'hexagon',
    borderStyle: 'solid',
    fillColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
};

export interface DiagramMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  entityCount: number;
  connectionCount: number;
  aiGenerationCount: number;
  totalTimeSeconds: number;
}

export interface SavedDiagram {
  metadata: DiagramMetadata;
  structure: DiagramStructure;
}
