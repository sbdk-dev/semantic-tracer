export enum EntityType {
  Entity = 'entity',
  Dimension = 'dimension',
  Measure = 'measure',
}

export interface EntityData {
  id: string;
  name: string;
  type: EntityType;
}
