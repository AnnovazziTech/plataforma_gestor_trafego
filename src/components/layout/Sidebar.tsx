'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Briefcase,
  Share2,
  MessageCircle,
  Palette,
} from 'lucide-react'
import { PlatformIcon } from '@/components/ui'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null },
  { icon: Megaphone, label: 'Campanhas', href: '/campaigns', badge: '12' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', badge: null },
  { icon: FileText, label: 'Relatorios', href: '/reports', badge: null },
  { icon: Briefcase, label: 'Administracao', href: '/admin', badge: null },
  { icon: Share2, label: 'Redes Sociais', href: '/social', badge: 'Novo' },
  { icon: MessageCircle, label: 'Mensagens', href: '/mensagens', badge: null },
  { icon: Palette, label: 'Criativos', href: '/criativos', badge: null },
  { icon: Zap, label: 'Automacao', href: '/automation', badge: null },
  { icon: Settings, label: 'Configuracoes', href: '/settings', badge: null },
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
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 50,
        background: 'linear-gradient(to bottom, #0D0D14, #0A0A0F, #080810)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? '72px' : '260px',
      }}
    >
      {/* Header - Logo */}
      <div
        style={{
          flexShrink: 0,
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #3B82F6, #2563EB, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Zap style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#22C55E',
                    borderRadius: '50%',
                    border: '2px solid #0A0A0F',
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  TrafficPro
                </h1>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#6B6B7B',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  Plataforma de Marketing
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #3B82F6, #2563EB, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Zap style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#22C55E',
                    borderRadius: '50%',
                    border: '2px solid #0A0A0F',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#1A1A25',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B6B7B',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          minHeight: 0,
          padding: '16px 12px',
          overflowY: 'auto',
        }}
      >
        {!isCollapsed && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#4B4B5B',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Menu Principal
          </span>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: isCollapsed ? '12px' : '10px 12px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? 0 : '12px',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#8B8B9B',
                    cursor: 'pointer',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '32px',
                        background: 'linear-gradient(to bottom, #3B82F6, #60A5FA)',
                        borderRadius: '0 4px 4px 0',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    }}
                  >
                    <item.icon
                      size={20}
                      style={{
                        color: isActive ? '#3B82F6' : '#6B6B7B',
                      }}
                    />
                  </div>

                  {!isCollapsed && (
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          flex: 1,
                          color: isActive ? '#FFFFFF' : '#8B8B9B',
                        }}
                      >
                        {item.label}
                      </span>

                      {item.badge && (
                        <span
                          style={{
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            borderRadius: '9999px',
                            backgroundColor: item.badge === 'Novo' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: item.badge === 'Novo' ? '#FACC15' : '#3B82F6',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ flexShrink: 0 }}>
        {/* Connected Platforms */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: isCollapsed ? '12px' : '12px 16px',
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#4B4B5B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Plataformas
              </span>
              <span style={{ fontSize: '10px', color: '#3B82F6', fontWeight: 500 }}>3/5</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexDirection: isCollapsed ? 'column' : 'row',
              flexWrap: isCollapsed ? 'nowrap' : 'wrap',
            }}
          >
            {platforms.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: platform.connected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  opacity: platform.connected ? 1 : 0.5,
                  cursor: 'pointer',
                }}
                title={`${platform.id}${platform.connected ? ' (Conectado)' : ' (Desconectado)'}`}
              >
                <PlatformIcon platform={platform.id} size={16} />
                {platform.connected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#22C55E',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upgrade Banner */}
        <AnimatePresence>
          {!isCollapsed && showUpgradeBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ padding: '0 12px 8px 12px', overflow: 'hidden' }}
            >
              <div
                style={{
                  position: 'relative',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.15), rgba(29, 78, 216, 0.1), rgba(124, 58, 237, 0.15))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px',
                    borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Crown style={{ width: '16px', height: '16px', color: '#FACC15' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FACC15' }}>PRO</span>
                </div>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                    paddingRight: '16px',
                    margin: 0,
                  }}
                >
                  Recursos avancados de automacao
                </p>
                <button
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles style={{ width: '12px', height: '12px' }} />
                  Fazer Upgrade
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Section */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: isCollapsed ? '8px' : '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '12px',
              padding: '8px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6, #EC4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                JS
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#22C55E',
                  borderRadius: '50%',
                  border: '2px solid #0A0A0F',
                }}
              />
            </div>
            {!isCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Joao Silva
                  </p>
                  <p
                    style={{
                      fontSize: '10px',
                      color: '#6B6B7B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      margin: 0,
                    }}
                  >
                    <Crown style={{ width: '12px', height: '12px', color: '#FACC15' }} />
                    Administrador
                  </p>
                </div>
                <button
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    color: '#6B6B7B',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
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
