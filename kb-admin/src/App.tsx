import { useState } from 'react'
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

function Shell() {
  const store = useStore()
  const [route, setRoute] = useState<Route>({ name: 'dashboard' })

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
