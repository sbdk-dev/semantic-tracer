import { EntityType, Jurisdiction, TaxStatus } from '@/types';

export const DEFAULT_JURISDICTIONS: Record<EntityType, Jurisdiction> = {
  corporation: 'Delaware',
  llc: 'Delaware',
  partnership: 'Delaware',
  individual: 'N/A',
  trust: 'Delaware',
  disregarded: 'Delaware',
  foreign: 'Cayman Islands',
  asset: 'N/A',
};

export const DEFAULT_TAX_STATUS: Record<EntityType, TaxStatus> = {
  corporation: 'us',
  llc: 'passthrough',
  partnership: 'passthrough',
  individual: 'us',
  trust: 'us',
  disregarded: 'passthrough',
  foreign: 'foreign',
  asset: 'us',
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  corporation: 'Corporation',
  llc: 'LLC',
  partnership: 'Partnership',
  individual: 'Individual',
  trust: 'Trust',
  disregarded: 'Disregarded Entity',
  foreign: 'Foreign Entity',
  asset: 'Asset',
};

export const COMMON_JURISDICTIONS: Jurisdiction[] = [
  'Delaware',
  'Nevada',
  'Cayman Islands',
  'Texas',
  'California',
  'New York',
  'Florida',
  'Wyoming',
  'British Virgin Islands',
  'Luxembourg',
];

export const FINCEN_BENEFICIAL_OWNERSHIP_THRESHOLD = 25;

export const LAYOUT_SPACING = {
  HORIZONTAL: 150,
  VERTICAL: 100,
} as const;

export const NODE_DIMENSIONS = {
  WIDTH: 180,
  HEIGHT: 60,
} as const;
