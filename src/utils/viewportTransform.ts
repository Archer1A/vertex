export type ViewportTransform = {
  x: number
  y: number
  scale: number
}

export type ViewportPoint = {
  x: number
  y: number
}

export type CanvasRect = {
  left: number
  top: number
  width: number
  height: number
}

export const MIN_VIEWPORT_SCALE = 0.45
export const MAX_VIEWPORT_SCALE = 2.4
export const GRAPH_NODE_MIN_X = 8
export const GRAPH_NODE_MAX_X = 94
export const GRAPH_NODE_MIN_Y = 10
export const GRAPH_NODE_MAX_Y = 90

export function clampScale(
  value: number,
  minScale = MIN_VIEWPORT_SCALE,
  maxScale = MAX_VIEWPORT_SCALE
) {
  return Math.min(maxScale, Math.max(minScale, value))
}

export function zoomViewportAtPoint(
  viewport: ViewportTransform,
  nextScale: number,
  point: ViewportPoint
): ViewportTransform {
  const scale = clampScale(nextScale)
  const worldX = (point.x - viewport.x) / viewport.scale
  const worldY = (point.y - viewport.y) / viewport.scale

  return {
    x: point.x - worldX * scale,
    y: point.y - worldY * scale,
    scale
  }
}

export function getGraphPercentPosition({
  clientX,
  clientY,
  rect,
  viewport,
  offsetX = 0,
  offsetY = 0
}: {
  clientX: number
  clientY: number
  rect: CanvasRect
  viewport: ViewportTransform
  offsetX?: number
  offsetY?: number
}) {
  const graphX = (clientX - offsetX - rect.left - viewport.x) / viewport.scale
  const graphY = (clientY - offsetY - rect.top - viewport.y) / viewport.scale

  return {
    x: (graphX / rect.width) * 100,
    y: (graphY / rect.height) * 100
  }
}

export function clampGraphNodePosition(position: ViewportPoint) {
  return {
    x: Math.min(GRAPH_NODE_MAX_X, Math.max(GRAPH_NODE_MIN_X, position.x)),
    y: Math.min(GRAPH_NODE_MAX_Y, Math.max(GRAPH_NODE_MIN_Y, position.y))
  }
}
