import { useState } from 'react'
import {
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  LibraryBig,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Route, Space } from '@/types'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#dc2626', '#0891b2']

export function SpacesPage({ navigate }: { navigate: (r: Route) => void }) {
  const store = useStore()
  const isAdmin = store.currentUser.role === 'admin'
  // 只展示当前用户有权查看的知识库
  const visibleSpaces = store.spaces.filter((s) => store.canView(s))
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Space | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [confirmDelete, setConfirmDelete] = useState<Space | null>(null)

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDesc('')
    setColor(COLORS[0])
    setVisibility('public')
    setOpen(true)
  }

  const openEdit = (s: Space) => {
    setEditing(s)
    setName(s.name)
    setDesc(s.description)
    setColor(s.color)
    setVisibility(s.visibility)
    setOpen(true)
  }

  const submit = () => {
    if (!name.trim()) {
      toast.error('请输入知识库名称')
      return
    }
    if (editing) {
      store.updateSpace(editing.id, { name: name.trim(), description: desc, color, visibility })
      toast.success('知识库已更新')
    } else {
      store.createSpace({ name: name.trim(), description: desc, color, visibility })
      toast.success('知识库创建成功')
    }
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">知识库</h1>
          <p className="text-sm text-muted-foreground">
            创建知识库空间、维护目录层级并配置访问权限
          </p>
        </div>
        {isAdmin && (
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建知识库
          </Button>
        )}
      </div>

      {visibleSpaces.length === 0 && !isAdmin && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          暂无可访问的知识库，请联系管理员为您授权。
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSpaces.map((s) => {
          const docCount = store.docs.filter((d) => d.spaceId === s.id).length
          const nodeCount = store.nodes.filter((n) => n.spaceId === s.id).length
          return (
            <Card key={s.id} className="group relative transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate({ name: 'space', id: s.id })}
                    className="flex cursor-pointer items-center gap-3 text-left"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-base font-semibold text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.name.slice(0, 1)}
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight hover:text-primary">
                        {s.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                        {s.visibility === 'public' ? (
                          <>
                            <Eye className="h-3 w-3" /> 全员可见
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> 私密空间
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </button>
                  {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer text-muted-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(s)}>
                        <Pencil className="mr-2 h-4 w-4" /> 编辑信息
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => setConfirmDelete(s)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> 删除知识库
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent
                className="cursor-pointer pb-4"
                onClick={() => navigate({ name: 'space', id: s.id })}
              >
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                  {s.description || '暂无描述'}
                </p>
              </CardContent>
              <CardFooter className="gap-2 border-t pt-3">
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" /> {docCount} 文档
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FolderTree className="h-3 w-3" /> {nodeCount} 目录
                </Badge>
                <Badge variant="outline" className="ml-auto text-[11px]">
                  创建于 {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                </Badge>
              </CardFooter>
            </Card>
          )
        })}

        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <LibraryBig className="h-8 w-8" />
            <span className="text-sm font-medium">新建知识库</span>
            <span className="text-xs">沉淀团队知识资产</span>
          </button>
        )}
      </div>

      {/* 新建 / 编辑对话框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑知识库' : '新建知识库'}</DialogTitle>
            <DialogDescription>
              知识库是文档与目录的顶层容器，可在库内继续建立多级目录。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：产品手册"
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="简要说明该知识库的用途"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>标识颜色</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-7 w-7 cursor-pointer rounded-full transition-transform',
                      color === c && 'ring-2 ring-slate-400 ring-offset-2',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>可见性</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'private')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公开 - 组织内全员可见</SelectItem>
                  <SelectItem value="private">私有 - 仅授权成员可见</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button className="cursor-pointer" onClick={submit}>
              {editing ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除知识库？</DialogTitle>
            <DialogDescription>
              将删除「{confirmDelete?.name}」及其全部目录与文档，该操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setConfirmDelete(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                store.deleteSpace(confirmDelete!.id)
                toast.success('知识库已删除')
                setConfirmDelete(null)
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
