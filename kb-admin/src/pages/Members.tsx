import { useState } from 'react'
import { Eye, EyeOff, Pencil, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { ROLE_LABEL, type Role } from '@/types'

const ROLES: Role[] = ['admin', 'editor', 'viewer']

const ROLE_BADGE: Record<Role, { className: string }> = {
  admin: { className: 'bg-blue-50 text-blue-700 border-blue-200' },
  editor: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  viewer: { className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export function MembersPage() {
  const store = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', dept: '', role: 'viewer' as Role })
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const memberToRemove = store.members.find((m) => m.id === confirmRemove)

  const submitAdd = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('请填写姓名和邮箱')
      return
    }
    if (store.members.some((m) => m.email === form.email.trim())) {
      toast.error('该邮箱已存在')
      return
    }
    store.addMember({ ...form, name: form.name.trim(), email: form.email.trim(), dept: form.dept.trim() || '未分配' })
    toast.success('成员已添加')
    setForm({ name: '', email: '', dept: '', role: 'viewer' })
    setAddOpen(false)
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">成员与权限</h1>
        <p className="text-sm text-muted-foreground">
          管理平台成员角色，并为每个知识库配置查看 / 编辑权限
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="cursor-pointer gap-1.5">
            <Users className="h-4 w-4" /> 成员管理
          </TabsTrigger>
          <TabsTrigger value="spaceperms" className="cursor-pointer gap-1.5">
            <ShieldCheck className="h-4 w-4" /> 库权限配置
          </TabsTrigger>
        </TabsList>

        {/* 成员管理 */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">成员列表</CardTitle>
                <CardDescription>共 {store.members.length} 名成员</CardDescription>
              </div>
              <Button className="cursor-pointer" onClick={() => setAddOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                添加成员
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">成员</TableHead>
                    <TableHead className="w-36">部门</TableHead>
                    <TableHead className="w-40">角色</TableHead>
                    <TableHead className="w-24 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
                              {m.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.dept}</TableCell>
                      <TableCell>
                        <Select
                          value={m.role}
                          onValueChange={(v) => {
                            store.updateMember(m.id, { role: v as Role })
                            toast.success(`已将「${m.name}」设为${ROLE_LABEL[v as Role]}`)
                          }}
                        >
                          <SelectTrigger className="h-8 w-32 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r} className="cursor-pointer">
                                {ROLE_LABEL[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmRemove(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 库权限配置 */}
        <TabsContent value="spaceperms" className="mt-4 space-y-4">
          {store.spaces.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.name.slice(0, 1)}
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{s.name}</CardTitle>
                      <CardDescription className="text-xs">{s.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {s.visibility === 'public' ? (
                      <>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">公开库</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">私有库</span>
                      </>
                    )}
                    <Switch
                      className="cursor-pointer"
                      checked={s.visibility === 'public'}
                      onCheckedChange={(v) => {
                        store.updateSpace(s.id, { visibility: v ? 'public' : 'private' })
                        toast.success(`「${s.name}」已切换为${v ? '公开' : '私有'}`)
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 border-t pt-4 sm:grid-cols-2">
                {(['view', 'edit'] as const).map((key) => (
                  <div key={key}>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      {key === 'view' ? (
                        <>
                          <Eye className="h-4 w-4 text-primary" /> 可查看角色
                        </>
                      ) : (
                        <>
                          <Pencil className="h-4 w-4 text-primary" /> 可编辑角色
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {ROLES.map((r) => {
                        const checked = s.permissions[key].includes(r)
                        return (
                          <label
                            key={r}
                            className="flex cursor-pointer items-center gap-2.5 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              disabled={key === 'view' && r === 'admin'}
                              onCheckedChange={(v) => {
                              const next = v
                                ? [...s.permissions[key], r]
                                : s.permissions[key].filter((x) => x !== r)
                              // 授予编辑权时自动授予查看权；取消查看权时同步取消编辑权
                              const view =
                                key === 'view'
                                  ? next
                                  : !s.permissions.view.includes(r)
                                    ? [...s.permissions.view, r]
                                    : s.permissions.view
                              const edit =
                                key === 'edit'
                                  ? next
                                  : s.permissions.edit.includes(r)
                                    ? s.permissions.edit.filter((x) => x !== r)
                                    : s.permissions.edit
                              store.updateSpace(s.id, { permissions: { view, edit } })
                              toast.success('权限已更新')
                            }}
                            />
                            <Badge variant="outline" className={ROLE_BADGE[r].className}>
                              {ROLE_LABEL[r]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {r === 'admin'
                                ? '拥有全部管理权限'
                                : r === 'editor'
                                  ? '可创建、编辑、上传文档'
                                  : '仅可浏览与检索'}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* 添加成员 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加成员</DialogTitle>
            <DialogDescription>新成员加入后将按所选角色获得对应权限</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="成员姓名" />
              </div>
              <div className="space-y-2">
                <Label>部门</Label>
                <Input value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} placeholder="所属部门" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="cursor-pointer">
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setAddOpen(false)}>
              取消
            </Button>
            <Button className="cursor-pointer" onClick={submitAdd}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移除成员确认 */}
      <Dialog open={!!confirmRemove} onOpenChange={(v) => !v && setConfirmRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认移除成员？</DialogTitle>
            <DialogDescription>
              将移除「{memberToRemove?.name}」，其将不再拥有平台访问权限。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setConfirmRemove(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                store.removeMember(confirmRemove!)
                toast.success('成员已移除')
                setConfirmRemove(null)
              }}
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
