/**
 * Bottom-dock wire contract.
 */

export interface DockItemDTO {
  id: string;
  label: string;
  status: 'running' | 'paused' | 'done' | 'error';
  progress?: number;
  href?: string;
}

export interface DockResponseDTO {
  items: DockItemDTO[];
}
