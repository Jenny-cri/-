import {
  FileText,
  LibraryBig,
  Plus,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/lib/store'
import { type Route } from '@/types'

interface Props {
  navigate: (r: Route) => void
}

export function DashboardPage({ navigate }: Props) {
  const store = useStore()
  const isAdmin = store.currentUser.role === 'admin'
  // 统计与列表只统计当前用户有权查看的知识库
  const viewableSpaces = store.spaces.filter((s) => store.canView(s))
  const viewableSpaceIds = new Set(viewableSpaces.map((s) => s.id))
  const viewableDocs = store.docs.filter((d) => viewableSpaceIds.has(d.spaceId))
  const recent = [...viewableDocs]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)
  const weekNew = viewableDocs.filter(
    (d) => Date.now() - new Date(d.createdAt).getTime() < 7 * 86400000,
  ).length

  const stats = [
    { label: '知识库总数', value: viewableSpaces.length, icon: LibraryBig, hint: '企业知识空间' },
    { label: '文档总数', value: viewableDocs.length, icon: FileText, hint: `本周新增 ${weekNew} 篇` },
    isAdmin
      ? { label: '成员总数', value: store.members.length, icon: Users, hint: '含 3 种角色' }
      : {
          label: '可编辑知识库',
          value: viewableSpaces.filter((s) => store.canEdit(s)).length,
          icon: Users,
          hint: '当前角色可编辑',
        },
    {
      label: '目录节点',
      value: store.nodes.filter((n) => viewableSpaceIds.has(n.spaceId)).length,
      icon: TrendingUp,
      hint: '多级层级结构',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">仪表盘</h1>
          <p className="text-sm text-muted-foreground">知识库运营总览</p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => navigate({ name: 'spaces' })}
        >
          <Plus className="mr-2 h-4 w-4" />
          管理知识库
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold leading-none">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground/80">{s.hint}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">最近更新的文档</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">文档标题</TableHead>
                  <TableHead>所属知识库</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((d) => {
                  const space = store.spaces.find((s) => s.id === d.spaceId)
                  return (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => navigate({ name: 'doc', id: d.id })}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{d.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{space?.name ?? '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(d.updatedAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">知识库</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {viewableSpaces.map((s) => {
              const count = store.docs.filter((d) => d.spaceId === s.id).length
              return (
                <button
                  key={s.id}
                  onClick={() => navigate({ name: 'space', id: s.id })}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-200 hover:bg-slate-50"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{s.name}</span>
                      {s.visibility === 'private' && (
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          私有
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {count} 篇文档 · {store.nodes.filter((n) => n.spaceId === s.id).length} 个目录
                    </div>
                  </div>
                </button>
              )
            })}
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => navigate({ name: 'spaces' })}
            >
              <Upload className="mr-2 h-4 w-4" />
              上传与管理
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
