/**
 * Alignment Hook
 *
 * Handles alignment and distribution of selected nodes.
 * Provides tools to align nodes left/right/top/bottom/center and distribute evenly.
 */

import { useCallback } from 'react';
import { useDiagramState } from './useDiagramState';

export type AlignmentType = 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical';
export type DistributionType = 'horizontal' | 'vertical';

export function useAlignment() {
  const nodes = useDiagramState((state) => state.nodes);
  const setNodes = useDiagramState((state) => state.setNodes);

  // Get selected nodes
  const getSelectedNodes = useCallback(() => {
    return nodes.filter((n) => n.selected);
  }, [nodes]);

  // Align selected nodes
  const align = useCallback(
    (type: AlignmentType) => {
      const selectedNodes = getSelectedNodes();

      if (selectedNodes.length < 2) {
        console.log('Select at least 2 nodes to align');
        return false;
      }

      // Calculate bounds
      const positions = selectedNodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        width: (n.width as number) || 200, // Default width if not set
        height: (n.height as number) || 100, // Default height if not set
      }));

      let targetValue: number;

      switch (type) {
        case 'left':
          targetValue = Math.min(...positions.map((p) => p.x));
          setNodes((nds) =>
            nds.map((n) =>
              n.selected ? { ...n, position: { ...n.position, x: targetValue } } : n
            )
          );
          break;

        case 'right':
          const maxRight = Math.max(...positions.map((p) => p.x + p.width));
          setNodes((nds) =>
            nds.map((n) => {
              if (!n.selected) return n;
              const width = (n.width as number) || 200;
              return { ...n, position: { ...n.position, x: maxRight - width } };
            })
          );
          break;

        case 'top':
          targetValue = Math.min(...positions.map((p) => p.y));
          setNodes((nds) =>
            nds.map((n) =>
              n.selected ? { ...n, position: { ...n.position, y: targetValue } } : n
            )
          );
          break;

        case 'bottom':
          const maxBottom = Math.max(...positions.map((p) => p.y + p.height));
          setNodes((nds) =>
            nds.map((n) => {
              if (!n.selected) return n;
              const height = (n.height as number) || 100;
              return { ...n, position: { ...n.position, y: maxBottom - height } };
            })
          );
          break;

        case 'center-horizontal':
          const avgX = positions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / positions.length;
          setNodes((nds) =>
            nds.map((n) => {
              if (!n.selected) return n;
              const width = (n.width as number) || 200;
              return { ...n, position: { ...n.position, x: avgX - width / 2 } };
            })
          );
          break;

        case 'center-vertical':
          const avgY = positions.reduce((sum, p) => sum + p.y + p.height / 2, 0) / positions.length;
          setNodes((nds) =>
            nds.map((n) => {
              if (!n.selected) return n;
              const height = (n.height as number) || 100;
              return { ...n, position: { ...n.position, y: avgY - height / 2 } };
            })
          );
          break;
      }

      console.log(`Aligned ${selectedNodes.length} nodes: ${type}`);
      return true;
    },
    [getSelectedNodes, setNodes]
  );

  // Distribute selected nodes evenly
  const distribute = useCallback(
    (type: DistributionType) => {
      const selectedNodes = getSelectedNodes();

      if (selectedNodes.length < 3) {
        console.log('Select at least 3 nodes to distribute');
        return false;
      }

      const positions = selectedNodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        width: (n.width as number) || 200,
        height: (n.height as number) || 100,
      }));

      if (type === 'horizontal') {
        // Sort by x position
        positions.sort((a, b) => a.x - b.x);
        const first = positions[0];
        const last = positions[positions.length - 1];

        if (!first || !last) {
          console.warn('Invalid positions');
          return false;
        }

        const totalSpace = last.x - (first.x + first.width);
        const gap = totalSpace / (positions.length - 1);

        let currentX = first.x + first.width + gap;
        for (let i = 1; i < positions.length - 1; i++) {
          const pos = positions[i];
          if (!pos) continue;

          setNodes((nds) =>
            nds.map((n) =>
              n.id === pos.id ? { ...n, position: { ...n.position, x: currentX } } : n
            )
          );
          currentX += pos.width + gap;
        }
      } else {
        // Sort by y position
        positions.sort((a, b) => a.y - b.y);
        const first = positions[0];
        const last = positions[positions.length - 1];

        if (!first || !last) {
          console.warn('Invalid positions');
          return false;
        }

        const totalSpace = last.y - (first.y + first.height);
        const gap = totalSpace / (positions.length - 1);

        let currentY = first.y + first.height + gap;
        for (let i = 1; i < positions.length - 1; i++) {
          const pos = positions[i];
          if (!pos) continue;

          setNodes((nds) =>
            nds.map((n) =>
              n.id === pos.id ? { ...n, position: { ...n.position, y: currentY } } : n
            )
          );
          currentY += pos.height + gap;
        }
      }

      console.log(`Distributed ${selectedNodes.length} nodes: ${type}`);
      return true;
    },
    [getSelectedNodes, setNodes]
  );

  const hasSelection = getSelectedNodes().length >= 2;

  return {
    align,
    distribute,
    hasSelection,
  };
}
