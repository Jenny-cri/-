import { useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  LibraryBig,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatSize, type Doc, type Route, type TreeNode } from '@/types'

interface Props {
  spaceId: string
  navigate: (r: Route) => void
}

/** 递归目录树 */
function TreeItem(props: {
  node: TreeNode
  nodes: TreeNode[]
  selectedId: string
  onSelect: (id: string) => void
  onAddChild: (node: TreeNode) => void
  onRename: (node: TreeNode) => void
  onDelete: (node: TreeNode) => void
  depth: number
}) {
  const { node, nodes, selectedId, onSelect, onAddChild, onRename, onDelete, depth } = props
  const [open, setOpen] = useState(depth < 1)
  const children = nodes.filter((n) => n.parentId === node.id)
  const hasChildren = children.length > 0

  return (
    <div>
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors duration-150',
          selectedId === node.id ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-slate-100',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        <button
          className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="h-1 w-1 rounded-full bg-current opacity-30" />
          )}
        </button>
        {selectedId === node.id ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <span className="truncate">{node.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-auto hidden h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded group-hover:flex hover:bg-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onAddChild(node)}>
              <FolderPlus className="mr-2 h-4 w-4" /> 新建子目录
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onRename(node)}>
              <Pencil className="mr-2 h-4 w-4" /> 重命名
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => onDelete(node)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> 删除目录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {open &&
        children.map((c) => (
          <TreeItem
            key={c.id}
            node={c}
            nodes={nodes}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onRename={onRename}
            onDelete={onDelete}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}

export function SpaceDetailPage({ spaceId, navigate }: Props) {
  const store = useStore()
  const space = store.spaces.find((s) => s.id === spaceId)
  const nodes = useMemo(
    () => store.nodes.filter((n) => n.spaceId === spaceId),
    [store.nodes, spaceId],
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 目录对话框状态
  const [folderDialog, setFolderDialog] = useState<{
    mode: 'create' | 'rename'
    parentId: string | null
    node?: TreeNode
  } | null>(null)
  const [folderName, setFolderName] = useState('')
  const [deleteNode, setDeleteNode] = useState<TreeNode | null>(null)

  const spaceDocs = store.docs.filter((d) => d.spaceId === spaceId)

  // 当前目录下的文档（root = 全部）
  const visibleDocs = useMemo(() => {
    let list: Doc[]
    if (selectedNodeId === 'root') {
      list = spaceDocs
    } else {
      const doomed = new Set<string>([selectedNodeId])
      let grew = true
      while (grew) {
        grew = false
        for (const n of nodes) {
          if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) {
            doomed.add(n.id)
            grew = true
          }
        }
      }
      list = spaceDocs.filter((d) => doomed.has(d.nodeId))
    }
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((d) => d.title.toLowerCase().includes(q))
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [spaceDocs, nodes, selectedNodeId, search])

  // 面包屑路径
  const path = useMemo(() => {
    const arr: TreeNode[] = []
    let cur = nodes.find((n) => n.id === selectedNodeId)
    while (cur) {
      arr.unshift(cur)
      cur = nodes.find((n) => n.id === cur!.parentId)
    }
    return arr
  }, [nodes, selectedNodeId])

  const currentNode = nodes.find((n) => n.id === selectedNodeId)

  if (!space) {
    return (
      <div className="p-6 text-sm text-muted-foreground">知识库不存在或已被删除。</div>
    )
  }

  const submitFolder = () => {
    if (!folderName.trim()) {
      toast.error('请输入目录名称')
      return
    }
    if (folderDialog?.mode === 'create') {
      store.addNode(spaceId, folderDialog.parentId, folderName.trim())
      toast.success('目录创建成功')
    } else if (folderDialog?.node) {
      store.renameNode(folderDialog.node.id, folderName.trim())
      toast.success('目录已重命名')
    }
    setFolderDialog(null)
  }

  const handleUpload = (files: FileList) => {
    let n = 0
    for (const f of Array.from(files)) {
      const ext = f.name.split('.').pop() ?? ''
      store.addDoc({
        spaceId,
        nodeId: selectedNodeId === 'root' ? 'root' : selectedNodeId,
        title: f.name.replace(/\.[^.]+$/, ''),
        content: `# ${f.name}\n\n文件已上传至知识库，此处为文件说明占位内容。\n\n- 类型：${ext.toUpperCase()}\n- 大小：${formatSize(f.size)}`,
        fileName: f.name,
        fileSize: f.size,
        fileType: ext.toUpperCase(),
        author: store.currentUser.name,
      })
      n++
    }
    toast.success(`成功上传 ${n} 个文件`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex h-full min-h-0">
      {/* 左侧目录树 */}
      <aside className="flex w-72 shrink-0 flex-col border-r bg-white">
        <div className="flex items-center gap-3 border-b p-4">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: space.color }}
          >
            {space.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{space.name}</div>
            <div className="text-xs text-muted-foreground">
              {space.visibility === 'public' ? '公开库' : '私有库'} · {spaceDocs.length} 篇文档
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div
            className={cn(
              'mb-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
              selectedNodeId === 'root' ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-slate-100',
            )}
            onClick={() => setSelectedNodeId('root')}
          >
            <LibraryBig className="h-4 w-4" />
            全部文档
          </div>
          {nodes
            .filter((n) => n.parentId === null)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((n) => (
              <TreeItem
                key={n.id}
                node={n}
                nodes={nodes}
                selectedId={selectedNodeId}
                onSelect={setSelectedNodeId}
                onAddChild={(node) => {
                  setFolderDialog({ mode: 'create', parentId: node.id })
                  setFolderName('')
                }}
                onRename={(node) => {
                  setFolderDialog({ mode: 'rename', parentId: null, node })
                  setFolderName(node.name)
                }}
                onDelete={(node) => setDeleteNode(node)}
                depth={1}
              />
            ))}
          {nodes.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              暂无目录，点击下方按钮创建
            </div>
          )}
        </div>
        <div className="border-t p-3">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => {
              setFolderDialog({ mode: 'create', parentId: null })
              setFolderName('')
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            新建一级目录
          </Button>
        </div>
      </aside>

      {/* 右侧文档列表 */}
      <section className="min-w-0 flex-1 overflow-auto">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <button
                      className="cursor-pointer hover:text-primary"
                      onClick={() => setSelectedNodeId('root')}
                    >
                      {space.name}
                    </button>
                  </BreadcrumbItem>
                  {path.map((p) => (
                    <span key={p.id} className="contents">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{p.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </span>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              {currentNode && (
                <Badge variant="secondary" className="ml-2">
                  {visibleDocs.length} 篇
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="在库内搜索文档…"
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                上传文档
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  const doc = store.addDoc({
                    spaceId,
                    nodeId: selectedNodeId === 'root' ? 'root' : selectedNodeId,
                    title: '未命名文档',
                    content: '',
                    author: store.currentUser.name,
                  })
                  navigate({ name: 'doc', id: doc.id })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新建文档
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文档标题</TableHead>
                <TableHead className="w-28">类型</TableHead>
                <TableHead className="w-36">作者</TableHead>
                <TableHead className="w-32">更新时间</TableHead>
                <TableHead className="w-20 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleDocs.map((d) => {
                const folder = d.nodeId !== 'root' ? nodes.find((n) => n.id === d.nodeId) : null
                return (
                  <TableRow key={d.id} className="cursor-pointer" onClick={() => navigate({ name: 'doc', id: d.id })}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{d.title}</span>
                        {folder && (
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {folder.name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {d.fileType ? (
                        <Badge variant="secondary">{d.fileType}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">在线文档</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.author}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(d.updatedAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                `${location.origin}/#/doc/${d.id}`,
                              )
                              toast.success('文档链接已复制')
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" /> 复制链接
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              store.deleteDoc(d.id)
                              toast.success('文档已删除')
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {visibleDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    当前目录暂无文档，点击右上角「上传文档」或「新建文档」
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 目录新建/重命名 */}
      <Dialog
        open={!!folderDialog}
        onOpenChange={(v) => {
          if (!v) setFolderDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {folderDialog?.mode === 'create' ? '新建目录' : '重命名目录'}
            </DialogTitle>
            <DialogDescription>
              {folderDialog?.mode === 'create' && folderDialog.parentId
                ? `将在「${nodes.find((n) => n.id === folderDialog.parentId)?.name}」下创建子目录`
                : '目录支持多级嵌套，用于组织知识库内容'}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="目录名称"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && submitFolder()}
          />
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setFolderDialog(null)}>
              取消
            </Button>
            <Button className="cursor-pointer" onClick={submitFolder}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 目录删除确认 */}
      <Dialog open={!!deleteNode} onOpenChange={(v) => !v && setDeleteNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除目录？</DialogTitle>
            <DialogDescription>
              将删除「{deleteNode?.name}」及其子目录下的全部文档，该操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setDeleteNode(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                store.deleteNode(deleteNode!.id)
                setSelectedNodeId('root')
                toast.success('目录已删除')
                setDeleteNode(null)
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
