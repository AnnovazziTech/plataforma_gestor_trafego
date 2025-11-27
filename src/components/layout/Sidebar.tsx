'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  FileText,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown,
  Sparkles,
  X,
} from 'lucide-react'
import { PlatformIcon } from '@/components/ui'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null },
  { icon: Megaphone, label: 'Campanhas', href: '/campaigns', badge: '12' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', badge: null },
  { icon: FileText, label: 'Relatórios', href: '/reports', badge: null },
  { icon: Zap, label: 'Automação', href: '/automation', badge: 'Novo' },
  { icon: Settings, label: 'Configurações', href: '/settings', badge: null },
]

const platforms = [
  { id: 'meta', connected: true },
  { id: 'google', connected: true },
  { id: 'tiktok', connected: true },
  { id: 'linkedin', connected: false },
  { id: 'twitter', connected: false },
] as const

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50',
        'bg-gradient-to-b from-[#0D0D14] via-[#0A0A0F] to-[#080810]',
        'border-r border-white/[0.06]',
        'transition-all duration-300 ease-out',
        'flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Efeito de brilho sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#3B82F6]/[0.03] to-transparent pointer-events-none" />

      {/* ===== HEADER - Logo (altura fixa) ===== */}
      <div className="flex-shrink-0 h-[72px] flex items-center px-4 border-b border-white/[0.06] relative">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A0A0F]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  TrafficPro
                </h1>
                <p className="text-[11px] text-[#6B6B7B] font-medium">Gestão de Tráfego</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A0A0F]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2',
            'w-6 h-6 rounded-full',
            'bg-[#1A1A25] border border-white/10',
            'flex items-center justify-center',
            'text-[#6B6B7B] hover:text-white',
            'hover:bg-[#3B82F6] hover:border-[#3B82F6]',
            'transition-all duration-200',
            'shadow-lg shadow-black/20',
            'z-10'
          )}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ===== NAVIGATION - Menu Principal (flex-1 com overflow) ===== */}
      <nav className="flex-1 min-h-0 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {!isCollapsed && (
          <span className="text-[10px] font-semibold text-[#4B4B5B] uppercase tracking-widest px-3 mb-2 block">
            Menu Principal
          </span>
        )}

        {menuItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'group relative flex items-center rounded-xl transition-all duration-200',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-gradient-to-r from-[#3B82F6]/20 to-[#3B82F6]/5 text-white'
                    : 'text-[#8B8B9B] hover:text-white hover:bg-white/[0.04]'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Indicador ativo */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#3B82F6] to-[#60A5FA] rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-[#3B82F6]/20'
                    : 'bg-transparent group-hover:bg-white/5'
                )}>
                  <item.icon
                    size={20}
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-[#3B82F6]' : 'text-[#6B6B7B] group-hover:text-white'
                    )}
                  />
                </div>

                {!isCollapsed && (
                  <>
                    <span className={cn(
                      'text-sm font-medium flex-1',
                      isActive && 'text-white'
                    )}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] font-semibold rounded-full',
                        item.badge === 'Novo'
                          ? 'bg-[#FACC15]/20 text-[#FACC15]'
                          : 'bg-[#3B82F6]/20 text-[#3B82F6]'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* ===== FOOTER - Elementos fixos na parte inferior ===== */}
      <div className="flex-shrink-0">
        {/* Connected Platforms */}
        <div className={cn(
          'border-t border-white/[0.06]',
          isCollapsed ? 'px-3 py-3' : 'px-4 py-3'
        )}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#4B4B5B] uppercase tracking-widest">
                Plataformas
              </span>
              <span className="text-[10px] text-[#3B82F6] font-medium">3/5</span>
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1.5',
            isCollapsed ? 'flex-col' : 'flex-wrap'
          )}>
            {platforms.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative p-2 rounded-lg transition-all duration-200 cursor-pointer',
                  platform.connected
                    ? 'bg-white/[0.06] hover:bg-white/[0.1]'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] opacity-50'
                )}
                title={`${platform.id}${platform.connected ? ' (Conectado)' : ' (Desconectado)'}`}
              >
                <PlatformIcon platform={platform.id} size={16} />
                {platform.connected && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upgrade Banner - apenas quando expandido e visível */}
        <AnimatePresence>
          {!isCollapsed && showUpgradeBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pb-2 overflow-hidden"
            >
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 via-[#1D4ED8]/10 to-[#7C3AED]/15 border border-[#3B82F6]/20">
                {/* Botão fechar */}
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  className="absolute top-2 right-2 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                >
                  <X size={12} />
                </button>

                <div className="flex items-center gap-2 mb-1.5">
                  <Crown className="w-4 h-4 text-[#FACC15]" />
                  <span className="text-xs font-semibold text-[#FACC15]">PRO</span>
                </div>
                <p className="text-[11px] text-white/70 mb-2 pr-4">
                  Recursos avançados de automação
                </p>
                <button className="w-full py-1.5 px-3 text-[11px] font-semibold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all duration-200 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Fazer Upgrade
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Section */}
        <div className={cn(
          'border-t border-white/[0.06]',
          isCollapsed ? 'p-2' : 'p-3'
        )}>
          <div className={cn(
            'group flex items-center rounded-xl transition-all duration-200',
            'hover:bg-white/[0.04] cursor-pointer',
            isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'
          )}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                JS
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0A0A0F]" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">João Silva</p>
                  <p className="text-[10px] text-[#6B6B7B] flex items-center gap-1">
                    <Crown className="w-3 h-3 text-[#FACC15]" />
                    Administrador
                  </p>
                </div>
                <button className="p-1.5 rounded-lg text-[#6B6B7B] hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_COLLAPSED_WIDTH = 72
