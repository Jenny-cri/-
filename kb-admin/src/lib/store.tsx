import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Doc, Member, Role, Space, TreeNode } from '@/types'

export interface AppData {
  spaces: Space[]
  nodes: TreeNode[]
  docs: Doc[]
  members: Member[]
  loggedIn: boolean
  currentUserName: string
}

const KEY = 'kb-admin-data-v1'

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString()

const DEFAULT_SPACE_PERMS = {
  view: ['admin', 'editor', 'viewer'] as Role[],
  edit: ['admin', 'editor'] as Role[],
}

function seed(): AppData {
  return {
    loggedIn: false,
    currentUserName: '系统管理员',
    spaces: [
      {
        id: 'sp1',
        name: '产品手册',
        description: '产品功能说明、使用指南与常见问题解答',
        color: '#2563eb',
        visibility: 'public',
        createdAt: daysAgo(120),
        permissions: { view: ['admin', 'editor', 'viewer'], edit: ['admin', 'editor'] },
      },
      {
        id: 'sp2',
        name: '研发知识库',
        description: '技术方案、架构设计、开发规范与经验总结',
        color: '#7c3aed',
        visibility: 'private',
        createdAt: daysAgo(90),
        permissions: { view: ['admin', 'editor'], edit: ['admin'] },
      },
      {
        id: 'sp3',
        name: '新员工入职指南',
        description: '入职流程、制度规范、办公工具使用说明',
        color: '#059669',
        visibility: 'public',
        createdAt: daysAgo(60),
        permissions: { view: ['admin', 'editor', 'viewer'], edit: ['admin', 'editor'] },
      },
    ],
    nodes: [
      { id: 'n1', spaceId: 'sp1', parentId: null, name: '产品概述', createdAt: daysAgo(100) },
      { id: 'n2', spaceId: 'sp1', parentId: null, name: '功能说明', createdAt: daysAgo(98) },
      { id: 'n3', spaceId: 'sp1', parentId: 'n2', name: '基础功能', createdAt: daysAgo(96) },
      { id: 'n4', spaceId: 'sp1', parentId: null, name: '常见问题', createdAt: daysAgo(80) },
      { id: 'n5', spaceId: 'sp2', parentId: null, name: '架构设计', createdAt: daysAgo(85) },
      { id: 'n6', spaceId: 'sp2', parentId: null, name: '开发规范', createdAt: daysAgo(84) },
      { id: 'n7', spaceId: 'sp3', parentId: null, name: '入职流程', createdAt: daysAgo(58) },
      { id: 'n8', spaceId: 'sp3', parentId: null, name: '制度规范', createdAt: daysAgo(55) },
    ],
    docs: [
      {
        id: 'd1', spaceId: 'sp1', nodeId: 'n1', title: '产品定位与核心价值',
        content: '# 产品定位与核心价值\n\n面向中大型企业的协作知识管理平台，帮助企业沉淀知识、提升协作效率。\n\n## 核心价值\n\n- **知识沉淀**：结构化存储企业文档资产\n- **高效检索**：全文检索快速定位内容\n- **权限管控**：多层级权限体系保障安全',
        author: '系统管理员', createdAt: daysAgo(99), updatedAt: daysAgo(5),
      },
      {
        id: 'd2', spaceId: 'sp1', nodeId: 'n3', title: '文档上传功能使用说明',
        content: '# 文档上传功能使用说明\n\n## 支持格式\n\n- doc / docx\n- pdf\n- md / txt\n- xlsx / pptx\n\n## 上传步骤\n\n1. 进入目标知识库\n2. 选择目标目录\n3. 点击「上传文档」并选择文件',
        author: '系统管理员', createdAt: daysAgo(95), updatedAt: daysAgo(3),
      },
      {
        id: 'd3', spaceId: 'sp1', nodeId: 'n4', title: '常见问题汇总 FAQ',
        content: '# 常见问题汇总\n\n## 忘记密码怎么办？\n\n请联系企业管理员重置密码。\n\n## 文档上传失败？\n\n请检查文件大小是否超过 50MB 限制。',
        author: '李文', createdAt: daysAgo(78), updatedAt: daysAgo(8),
      },
      {
        id: 'd4', spaceId: 'sp2', nodeId: 'n5', title: '系统整体架构设计 V2.0',
        content: '# 系统整体架构设计\n\n## 技术栈\n\n- 前端：React + TypeScript\n- 后端：Node.js + 微服务\n- 存储：对象存储 + 关系型数据库',
        author: '王凯', createdAt: daysAgo(84), updatedAt: daysAgo(2),
      },
      {
        id: 'd5', spaceId: 'sp2', nodeId: 'n6', title: '前端开发规范手册',
        content: '# 前端开发规范\n\n## 命名规范\n\n- 组件使用 PascalCase\n- 工具函数使用 camelCase\n\n## 提交规范\n\n- feat: 新功能\n- fix: 缺陷修复',
        author: '王凯', createdAt: daysAgo(80), updatedAt: daysAgo(12),
      },
      {
        id: 'd6', spaceId: 'sp3', nodeId: 'n7', title: '新员工入职流程指引',
        content: '# 新员工入职流程\n\n## Day 1\n\n- 领取办公设备\n- 开通各系统账号\n\n## 第一周\n\n- 完成入职培训\n- 熟悉团队与业务',
        author: '陈静', createdAt: daysAgo(57), updatedAt: daysAgo(6),
      },
      {
        id: 'd7', spaceId: 'sp3', nodeId: 'n8', title: '考勤与请假制度说明',
        content: '# 考勤与请假制度\n\n## 工作时间\n\n周一至周五 9:30 - 18:30\n\n## 请假流程\n\n1. 提交 OA 审批\n2. 直属上级审批\n3. HR 备案',
        author: '陈静', createdAt: daysAgo(54), updatedAt: daysAgo(20),
      },
    ],
    members: [
      { id: 'm1', name: '系统管理员', email: 'admin@company.com', dept: '信息部', role: 'admin' },
      { id: 'm2', name: '李文', email: 'liwen@company.com', dept: '产品部', role: 'editor' },
      { id: 'm3', name: '王凯', email: 'wangkai@company.com', dept: '研发部', role: 'editor' },
      { id: 'm4', name: '陈静', email: 'chenjing@company.com', dept: '人力资源部', role: 'editor' },
      { id: 'm5', name: '刘洋', email: 'liuyang@company.com', dept: '市场部', role: 'viewer' },
      { id: 'm6', name: '赵敏', email: 'zhaomin@company.com', dept: '财务部', role: 'viewer' },
    ],
  }
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    /* ignore */
  }
  return seed()
}

interface StoreApi extends AppData {
  currentUser: { name: string; email: string }
  login: (email: string) => void
  logout: () => void
  createSpace: (s: Pick<Space, 'name' | 'description' | 'color' | 'visibility'>) => Space
  updateSpace: (id: string, patch: Partial<Space>) => void
  deleteSpace: (id: string) => void
  addNode: (spaceId: string, parentId: string | null, name: string) => void
  renameNode: (id: string, name: string) => void
  deleteNode: (id: string) => void
  addDoc: (d: Omit<Doc, 'id' | 'createdAt' | 'updatedAt'>) => Doc
  updateDoc: (id: string, patch: Partial<Doc>) => void
  deleteDoc: (id: string) => void
  addMember: (m: Omit<Member, 'id'>) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  removeMember: (id: string) => void
  resetData: () => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [data])

  const login = useCallback((email: string) => {
    setData((d) => ({
      ...d,
      loggedIn: true,
      currentUserName: email.startsWith('admin') ? '系统管理员' : email.split('@')[0],
    }))
  }, [])

  const logout = useCallback(() => {
    setData((d) => ({ ...d, loggedIn: false }))
  }, [])

  const createSpace: StoreApi['createSpace'] = useCallback((s) => {
    const space: Space = {
      id: uid(),
      createdAt: now(),
      permissions: { ...DEFAULT_SPACE_PERMS },
      ...s,
    }
    setData((d) => ({ ...d, spaces: [space, ...d.spaces] }))
    return space
  }, [])

  const updateSpace: StoreApi['updateSpace'] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      spaces: d.spaces.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [])

  const deleteSpace: StoreApi['deleteSpace'] = useCallback((id) => {
    setData((d) => ({
      ...d,
      spaces: d.spaces.filter((s) => s.id !== id),
      nodes: d.nodes.filter((n) => n.spaceId !== id),
      docs: d.docs.filter((doc) => doc.spaceId !== id),
    }))
  }, [])

  const addNode: StoreApi['addNode'] = useCallback((spaceId, parentId, name) => {
    setData((d) => ({
      ...d,
      nodes: [...d.nodes, { id: uid(), spaceId, parentId, name, createdAt: now() }],
    }))
  }, [])

  const renameNode: StoreApi['renameNode'] = useCallback((id, name) => {
    setData((d) => ({
      ...d,
      nodes: d.nodes.map((n) => (n.id === id ? { ...n, name } : n)),
    }))
  }, [])

  const deleteNode: StoreApi['deleteNode'] = useCallback((id) => {
    setData((d) => {
      const doomed = new Set<string>([id])
      let grew = true
      while (grew) {
        grew = false
        for (const n of d.nodes) {
          if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) {
            doomed.add(n.id)
            grew = true
          }
        }
      }
      return {
        ...d,
        nodes: d.nodes.filter((n) => !doomed.has(n.id)),
        docs: d.docs.filter((doc) => !doomed.has(doc.nodeId)),
      }
    })
  }, [])

  const addDoc: StoreApi['addDoc'] = useCallback((d0) => {
    const doc: Doc = { id: uid(), createdAt: now(), updatedAt: now(), ...d0 }
    setData((d) => ({ ...d, docs: [doc, ...d.docs] }))
    return doc
  }, [])

  const updateDoc: StoreApi['updateDoc'] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      docs: d.docs.map((doc) =>
        doc.id === id ? { ...doc, ...patch, updatedAt: now() } : doc,
      ),
    }))
  }, [])

  const deleteDoc: StoreApi['deleteDoc'] = useCallback((id) => {
    setData((d) => ({ ...d, docs: d.docs.filter((doc) => doc.id !== id) }))
  }, [])

  const addMember: StoreApi['addMember'] = useCallback((m) => {
    setData((d) => ({ ...d, members: [...d.members, { id: uid(), ...m }] }))
  }, [])

  const updateMember: StoreApi['updateMember'] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      members: d.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const removeMember: StoreApi['removeMember'] = useCallback((id) => {
    setData((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }))
  }, [])

  const resetData = useCallback(() => setData(seed()), [])

  const api: StoreApi = {
    ...data,
    currentUser: { name: data.currentUserName, email: 'admin@company.com' },
    login,
    logout,
    createSpace,
    updateSpace,
    deleteSpace,
    addNode,
    renameNode,
    deleteNode,
    addDoc,
    updateDoc,
    deleteDoc,
    addMember,
    updateMember,
    removeMember,
    resetData,
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
