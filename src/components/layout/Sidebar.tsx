'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import {
  DollarSign,
  Users,
  Target,
  Image,
  Newspaper,
  BarChart3,
  TrendingUp,
  FileText,
  Share2,
  MessageSquare,
  Zap,
  Search,
  ShoppingBag,
  GraduationCap,
  Link as LinkIcon,
  Brain,
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown,
  Sparkles,
  X,
  Shield,
  LucideIcon,
} from 'lucide-react'
import { PlatformIcon } from '@/components/ui'
import { useApp } from '@/contexts'
import { useState } from 'react'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  DollarSign, Users, Target, Image, Newspaper,
  BarChart3, TrendingUp, FileText, Share2, MessageSquare,
  Zap, Search, ShoppingBag, GraduationCap, Link: LinkIcon, Brain,
  LayoutDashboard, CalendarDays, Receipt,
}

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
  const router = useRouter()
  const { data: session } = useSession()
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin === true
  const { setIsConnectAccountsModalOpen, showToast, modules } = useApp()
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handlePlatformClick = (platformId: string, connected: boolean) => {
    if (connected) {
      showToast(`${platformId.charAt(0).toUpperCase() + platformId.slice(1)} já está conectado`, 'info')
    } else {
      setIsConnectAccountsModalOpen(true)
    }
  }

  const handleUpgrade = () => {
    router.push('/settings')
    setTimeout(() => {
      const billingTab = document.querySelector('[data-tab="billing"]')
      if (billingTab) (billingTab as HTMLElement).click()
    }, 100)
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await signOut({ callbackUrl: '/login' })
  }

  // Build menu from modules
  const menuItems = modules.map(mod => {
    const IconComp = iconMap[mod.icon || ''] || DollarSign
    return {
      icon: IconComp,
      label: mod.name,
      href: mod.route,
      badge: mod.isFree ? null : null,
    }
  })

  // Always add Settings at the end
  menuItems.push({ icon: Settings, label: 'Configuracoes', href: '/settings', badge: null })

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
              <img
                src="/logo-trafficpro.svg"
                alt="TrafficPro"
                style={{ height: '36px', width: '100%', maxWidth: '220px', objectFit: 'contain', objectPosition: 'left center' }}
              />
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
                <img
                  src="/logo-128.png"
                  alt="TrafficPro"
                  style={{ width: '40px', height: '40px', borderRadius: '12px' }}
                />
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
              <NextLink key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
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
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#3B82F6',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              </NextLink>
            )
          })}
        </div>

        {/* Superadmin */}
        {isSuperAdmin && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {!isCollapsed && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#4B4B5B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', display: 'block' }}>
                Admin Global
              </span>
            )}
            <NextLink href="/superadmin" style={{ textDecoration: 'none' }}>
              <motion.div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  padding: isCollapsed ? '12px' : '10px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : '12px',
                  backgroundColor: pathname === '/superadmin' ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                  color: pathname === '/superadmin' ? '#FFFFFF' : '#8B8B9B',
                  cursor: 'pointer',
                }}
                title={isCollapsed ? 'Superadmin' : undefined}
              >
                {pathname === '/superadmin' && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '4px', height: '32px',
                      background: 'linear-gradient(to bottom, #A855F7, #C084FC)',
                      borderRadius: '0 4px 4px 0',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '8px',
                  backgroundColor: pathname === '/superadmin' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                }}>
                  <Shield size={20} style={{ color: pathname === '/superadmin' ? '#A855F7' : '#6B6B7B' }} />
                </div>
                {!isCollapsed && (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: pathname === '/superadmin' ? '#FFFFFF' : '#8B8B9B' }}>
                    Superadmin
                  </span>
                )}
              </motion.div>
            </NextLink>
          </div>
        )}
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
                onClick={() => handlePlatformClick(platform.id, platform.connected)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: platform.connected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  opacity: platform.connected ? 1 : 0.5,
                  cursor: 'pointer',
                }}
                title={`${platform.id}${platform.connected ? ' (Conectado)' : ' (Clique para conectar)'}`}
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
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px', padding: '4px', borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.4)', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Crown style={{ width: '16px', height: '16px', color: '#FACC15' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FACC15' }}>PRO</span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', paddingRight: '16px', margin: 0 }}>
                  Recursos avancados de automacao
                </p>
                <button
                  onClick={handleUpgrade}
                  style={{
                    width: '100%', padding: '6px 12px', fontSize: '11px', fontWeight: 600,
                    color: '#FFFFFF', background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
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
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#FFFFFF',
                }}
              >
                {(session?.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div
                style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '10px', height: '10px', backgroundColor: '#22C55E',
                  borderRadius: '50%', border: '2px solid #0A0A0F',
                }}
              />
            </div>
            {!isCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session?.user?.name || 'Usuario'}
                  </p>
                  <p style={{ fontSize: '10px', color: '#6B6B7B', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    {(() => {
                      const role = (session?.user as any)?.role
                      if (isSuperAdmin) return <><Crown style={{ width: '12px', height: '12px', color: '#FACC15' }} />Super Admin</>
                      if (role === 'OWNER') return <><Crown style={{ width: '12px', height: '12px', color: '#FACC15' }} />Proprietario</>
                      if (role === 'ADMIN') return <><Crown style={{ width: '12px', height: '12px', color: '#A855F7' }} />Administrador</>
                      return <>Membro</>
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Sair"
                  style={{ padding: '6px', borderRadius: '8px', color: '#6B6B7B', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '400px', backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '24px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <LogOut style={{ width: '24px', height: '24px', color: '#EF4444' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  Sair da Conta
                </h3>
                <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                  Tem certeza que deseja sair? Voce precisara fazer login novamente.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '12px 24px', borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'transparent', color: '#FFFFFF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '12px 24px', borderRadius: '12px', border: 'none',
                    backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_COLLAPSED_WIDTH = 72
