'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/components/layout'
import { ToastContainer } from '@/components/ui'
import { CreateCampaignModal, ConnectAccountsModal } from '@/components/modals'
import { AppProvider } from '@/contexts'
import { Loader2 } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Mostrar loading enquanto verifica autenticacao
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00F5FF] animate-spin" />
          <p className="text-[#6B6B7B] text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Nao renderizar nada se nao autenticado (vai redirecionar)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00F5FF] animate-spin" />
          <p className="text-[#6B6B7B] text-sm">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0A0A0F]">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main
          style={{
            marginLeft: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            transition: 'margin-left 0.3s ease-out'
          }}
          className="min-h-screen"
        >
          {children}
        </main>
        <CreateCampaignModal />
        <ConnectAccountsModal />
        <ToastContainer />
      </div>
    </AppProvider>
  )
}
