export type Role = 'admin' | 'editor' | 'viewer'

export const ROLE_LABEL: Record<Role, string> = {
  admin: '管理员',
  editor: '编辑者',
  viewer: '查看者',
}

export interface Member {
  id: string
  name: string
  email: string
  dept: string
  role: Role
}

export interface Space {
  id: string
  name: string
  description: string
  color: string
  visibility: 'public' | 'private'
  createdAt: string
  /** 库级别权限：哪些角色可查看 / 可编辑 */
  permissions: { view: Role[]; edit: Role[] }
}

export interface TreeNode {
  id: string
  spaceId: string
  parentId: string | null
  name: string
  createdAt: string
}

export interface Doc {
  id: string
  spaceId: string
  /** 所属目录 id，'root' 表示库根目录 */
  nodeId: string
  title: string
  content: string
  fileName?: string
  fileSize?: number
  fileType?: string
  author: string
  createdAt: string
  updatedAt: string
}

export type Route =
  | { name: 'dashboard' }
  | { name: 'spaces' }
  | { name: 'space'; id: string }
  | { name: 'doc'; id: string }
  | { name: 'members' }

export function formatSize(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
