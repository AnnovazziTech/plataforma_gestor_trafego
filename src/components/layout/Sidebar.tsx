'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { PlatformIcon } from '@/components/ui'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Megaphone, label: 'Campanhas', href: '/campaigns' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Relatorios', href: '/reports' },
  { icon: Zap, label: 'Automacao', href: '/automation' },
  { icon: Settings, label: 'Configuracoes', href: '/settings' },
]

const platforms = ['meta', 'google', 'tiktok', 'linkedin', 'twitter'] as const

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 flex flex-col',
        'bg-[#0A0A0F] border-r border-white/10',
        'transition-all duration-300 ease-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5FF] via-[#BF00FF] to-[#FF00E5] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-base font-bold gradient-text whitespace-nowrap">TrafficPro</h1>
                <p className="text-[10px] text-[#6B6B7B] whitespace-nowrap">Gestao de Trafego</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5FF] via-[#BF00FF] to-[#FF00E5] flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg hover:bg-white/10 text-[#A0A0B0] hover:text-white transition-colors',
            isCollapsed && 'absolute -right-3 top-4 bg-[#0A0A0F] border border-white/10'
          )}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'text-[#A0A0B0] hover:text-white',
                  isActive && 'bg-gradient-to-r from-[#00F5FF]/20 to-transparent text-[#00F5FF] border-l-2 border-[#00F5FF]',
                  !isActive && 'hover:bg-white/5',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <item.icon size={20} className={cn('flex-shrink-0', isActive ? 'text-[#00F5FF]' : '')} />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00F5FF] flex-shrink-0" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Connected Platforms */}
      {!isCollapsed && (
        <div className="px-3 py-3 border-t border-white/10">
          <span className="text-[10px] font-medium text-[#6B6B7B] uppercase tracking-wider mb-2 block px-1">
            Plataformas
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {platforms.map((platform) => (
              <div
                key={platform}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <PlatformIcon platform={platform} size={16} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="p-3 border-t border-white/10">
        <div className={cn(
          'flex items-center gap-2 p-2 rounded-xl bg-white/5',
          isCollapsed && 'justify-center p-2'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#BF00FF] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            JS
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Joao Silva</p>
              <p className="text-[10px] text-[#6B6B7B] truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export const SIDEBAR_WIDTH = 256
export const SIDEBAR_COLLAPSED_WIDTH = 80
