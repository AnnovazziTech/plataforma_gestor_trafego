'use client'

import { useState } from 'react'
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/components/layout'
import { ToastContainer } from '@/components/ui'
import { CreateCampaignModal, ConnectAccountsModal } from '@/components/modals'
import { AppProvider } from '@/contexts'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

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
