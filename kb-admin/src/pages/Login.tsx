import { useState } from 'react'
import { BookOpen, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'

export function LoginPage() {
  const store = useStore()
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('admin123')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-semibold">知识库管理平台</h1>
          <p className="text-sm text-muted-foreground">管理员后台 · 文档 · 层级 · 权限</p>
        </div>
        <Card className="shadow-xl shadow-slate-200/60">
          <CardHeader>
            <CardTitle>管理员登录</CardTitle>
            <CardDescription>请使用管理员账号登录后台管理系统</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                store.login(email)
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                <Lock className="mr-2 h-4 w-4" />
                登录后台
              </Button>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground">
                <div className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  演示账号（密码任意），可体验不同角色的权限差异：
                </div>
                <ul className="space-y-0.5">
                  <li>
                    <code>admin@company.com</code> — 管理员（全部权限）
                  </li>
                  <li>
                    <code>liwen@company.com</code> — 编辑者（可编辑公开库）
                  </li>
                  <li>
                    <code>liuyang@company.com</code> — 查看者（仅浏览）
                  </li>
                  <li>
                    <code>wangkai@company.com</code> — 编辑者（可访问私有库）
                  </li>
                </ul>
                <div className="mt-1.5">未注册邮箱将以管理员身份进入。</div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
