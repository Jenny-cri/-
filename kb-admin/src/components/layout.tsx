import { useState } from 'react'
import {
  BookOpen,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import type { Route } from '@/types'
import { cn } from '@/lib/utils'

interface LayoutProps {
  route: Route
  navigate: (r: Route) => void
  children: React.ReactNode
}

const NAV_ITEMS = [
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard, route: { name: 'dashboard' } as Route },
  { key: 'spaces', label: '知识库', icon: LibraryBig, route: { name: 'spaces' } as Route },
  { key: 'members', label: '成员与权限', icon: ShieldCheck, route: { name: 'members' } as Route },
]

export function AppLayout({ route, navigate, children }: LayoutProps) {
  const store = useStore()
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const results = query
    ? store.docs.filter((d) => d.title.toLowerCase().includes(query)).slice(0, 6)
    : []

  return (
    <div className="flex h-screen bg-slate-50">
      {/* 侧边栏 */}
      <aside className="flex w-60 shrink-0 flex-col border-r bg-white">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-4.5 w-4.5" size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">知识库管理平台</div>
            <div className="text-[11px] text-muted-foreground">Knowledge Base Admin</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              route.name === item.key ||
              (route.name === 'space' && item.key === 'spaces') ||
              (route.name === 'doc' && item.key === 'spaces')
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.route)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="border-t p-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              管理员控制台
            </div>
            数据保存在本地浏览器，可用于演示与体验。
          </div>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
          <div className="relative w-80 max-w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索全部文档…"
              className="pl-9"
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg">
                {results.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      navigate({ name: 'doc', id: d.id })
                      setQ('')
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{d.title}</span>
                    <ChevronsRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex cursor-pointer items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                      管
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium leading-tight">{store.currentUser.name}</div>
                    <div className="text-[11px] leading-tight text-muted-foreground">管理员</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{store.currentUser.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => store.logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
