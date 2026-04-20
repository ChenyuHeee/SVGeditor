export interface EditorState {
  version: string
  canvasJSON: any
}

export interface ToolbarAction {
  label: string
  icon?: string
  handler: () => void
}