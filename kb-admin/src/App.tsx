import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout'
import { StoreProvider, useStore } from '@/lib/store'
import { DashboardPage } from '@/pages/Dashboard'
import { DocPage } from '@/pages/DocPage'
import { LoginPage } from '@/pages/Login'
import { MembersPage } from '@/pages/Members'
import { SpaceDetailPage } from '@/pages/SpaceDetail'
import { SpacesPage } from '@/pages/Spaces'
import type { Route } from '@/types'

/** 路由 → hash，使「复制链接」得到的地址真实可用 */
function routeToHash(r: Route): string {
  switch (r.name) {
    case 'dashboard':
      return '#/'
    case 'spaces':
      return '#/spaces'
    case 'space':
      return `#/space/${r.id}`
    case 'doc':
      return `#/doc/${r.id}`
    case 'members':
      return '#/members'
  }
}

/** hash → 路由，刷新后可恢复当前页面 */
function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [head, id] = h.split('/')
  if (head === 'spaces') return { name: 'spaces' }
  if (head === 'space' && id) return { name: 'space', id }
  if (head === 'doc' && id) return { name: 'doc', id }
  if (head === 'members') return { name: 'members' }
  return { name: 'dashboard' }
}

const sameRoute = (a: Route, b: Route) =>
  a.name === b.name && (a as { id?: string }).id === (b as { id?: string }).id

function Shell() {
  const store = useStore()
  const [route, setRoute] = useState<Route>(parseHash)

  // 路由变化时同步到地址栏 hash
  useEffect(() => {
    const target = routeToHash(route)
    if (window.location.hash !== target) {
      window.location.hash = target
    }
  }, [route])

  // 监听 hash 变化（粘贴链接、浏览器前进后退）
  useEffect(() => {
    const onHash = () => {
      const r = parseHash()
      setRoute((prev) => (sameRoute(prev, r) ? prev : r))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (!store.loggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  return (
    <>
      <AppLayout route={route} navigate={setRoute}>
        {route.name === 'dashboard' && <DashboardPage navigate={setRoute} />}
        {route.name === 'spaces' && <SpacesPage navigate={setRoute} />}
        {route.name === 'space' && <SpaceDetailPage spaceId={route.id} navigate={setRoute} />}
        {route.name === 'doc' && <DocPage docId={route.id} navigate={setRoute} />}
        {route.name === 'members' && <MembersPage />}
      </AppLayout>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
