'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PlatformIcon } from '@/components/ui'
import { currentUser } from '@/data/mock-data'
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Link2,
  LogOut,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Trash2,
  Plus,
} from 'lucide-react'
import { Platform, ConnectedAccount } from '@/types'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', label: 'Conta', icon: User },
    { id: 'integrations', label: 'Integrações', icon: Link2 },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'billing', label: 'Faturamento', icon: CreditCard },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

  return (
    <div className="min-h-screen">
      <Header
        title="Configurações"
        subtitle="Gerencie suas preferências e conta"
      />

      <main className="p-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#3B82F6]/15 to-transparent text-[#3B82F6] border-l-2 border-[#3B82F6]'
                      : 'text-[#A0A0B0] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={18} />
                <span className="text-sm font-medium">Sair da Conta</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'integrations' && <IntegrationsSettings />}
            {activeTab === 'notifications' && <NotificationsSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'billing' && <BillingSettings />}
            {activeTab === 'security' && <SecuritySettings />}
          </div>
        </div>
      </main>
    </div>
  )
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#3B82F6]/20">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{currentUser.name}</h3>
              <p className="text-sm text-[#6B6B7B]">{currentUser.email}</p>
              <Badge variant="info" className="mt-2">
                {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'manager' ? 'Gerente' : 'Visualizador'}
              </Badge>
            </div>
            <Button variant="secondary" className="ml-auto">
              Alterar Foto
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Nome</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Email</label>
              <input
                type="email"
                defaultValue={currentUser.email}
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Telefone</label>
              <input
                type="tel"
                placeholder="+55 (11) 99999-9999"
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Empresa</label>
              <input
                type="text"
                placeholder="Nome da empresa"
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="primary">Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationsSettings() {
  const allPlatforms: { platform: Platform; name: string; description: string }[] = [
    { platform: 'meta', name: 'Meta Ads', description: 'Facebook e Instagram Ads' },
    { platform: 'google', name: 'Google Ads', description: 'Search, Display, YouTube' },
    { platform: 'tiktok', name: 'TikTok Ads', description: 'TikTok For Business' },
    { platform: 'linkedin', name: 'LinkedIn Ads', description: 'LinkedIn Campaign Manager' },
    { platform: 'twitter', name: 'X Ads', description: 'Twitter Advertising' },
    { platform: 'pinterest', name: 'Pinterest Ads', description: 'Pinterest Business' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plataformas Conectadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentUser.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <PlatformIcon platform={account.platform} size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{account.name}</h4>
                    <p className="text-xs text-[#6B6B7B]">ID: {account.accountId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={account.status === 'connected' ? 'success' : 'error'}>
                      {account.status === 'connected' ? 'Conectado' : 'Erro'}
                    </Badge>
                    {account.lastSync && (
                      <p className="text-xs text-[#6B6B7B] mt-1">
                        Sync: {new Date(account.lastSync).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all">
                      <RefreshCw size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-red-400 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {allPlatforms
              .filter(p => !currentUser.accounts.find(a => a.platform === p.platform))
              .map((platform) => (
                <motion.button
                  key={platform.platform}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-[#3B82F6]/10 transition-colors">
                    <PlatformIcon platform={platform.platform} size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-white">{platform.name}</h4>
                    <p className="text-xs text-[#6B6B7B]">{platform.description}</p>
                  </div>
                  <Plus size={18} className="ml-auto text-[#6B6B7B] group-hover:text-[#3B82F6] transition-colors" />
                </motion.button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    slack: false,
    alerts: true,
    reports: true,
    updates: false,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email', description: 'Receber notificações por email' },
              { key: 'push', label: 'Push', description: 'Notificações no navegador' },
              { key: 'slack', label: 'Slack', description: 'Integrar com canal do Slack' },
            ].map((channel) => (
              <div
                key={channel.key}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <h4 className="text-sm font-medium text-white">{channel.label}</h4>
                  <p className="text-xs text-[#6B6B7B]">{channel.description}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [channel.key]: !prev[channel.key as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full transition-all ${
                    notifications[channel.key as keyof typeof notifications]
                      ? 'bg-[#3B82F6]'
                      : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                    notifications[channel.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'alerts', label: 'Alertas de Performance', description: 'CPA alto, CTR baixo, etc' },
              { key: 'reports', label: 'Relatórios', description: 'Quando relatórios são gerados' },
              { key: 'updates', label: 'Atualizações do Sistema', description: 'Novidades e melhorias' },
            ].map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <h4 className="text-sm font-medium text-white">{type.label}</h4>
                  <p className="text-xs text-[#6B6B7B]">{type.description}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [type.key]: !prev[type.key as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full transition-all ${
                    notifications[type.key as keyof typeof notifications]
                      ? 'bg-[#3B82F6]'
                      : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                    notifications[type.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('#3B82F6')

  const colors = ['#3B82F6', '#60A5FA', '#FACC15', '#FDE047', '#1D4ED8', '#EAB308']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'dark', label: 'Escuro', bg: 'bg-[#0A0A0F]' },
              { id: 'light', label: 'Claro', bg: 'bg-white' },
              { id: 'system', label: 'Sistema', bg: 'bg-gradient-to-r from-[#0A0A0F] to-white' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border transition-all ${
                  theme === t.id
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-full h-20 rounded-lg ${t.bg} mb-3`} />
                <p className="text-sm text-white">{t.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cor de Destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-10 h-10 rounded-full transition-all ${
                  accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0F]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#FACC15]/20 border border-[#3B82F6]/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Plano Pro</h3>
                <p className="text-sm text-[#A0A0B0]">Faturamento mensal</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">R$ 297</p>
                <p className="text-sm text-[#6B6B7B]">/mês</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                'Até 50 campanhas ativas',
                'Todas as plataformas',
                'Relatórios ilimitados',
                'Automações avançadas',
                'Suporte prioritário',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-[#A0A0B0]">
                  <Check size={14} className="text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary">Alterar Plano</Button>
              <Button variant="ghost">Cancelar Assinatura</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <CreditCard size={20} className="text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">**** **** **** 4242</p>
                <p className="text-xs text-[#6B6B7B]">Expira em 12/2025</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Alterar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Senha Atual</label>
              <input
                type="password"
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Nova Senha</label>
              <input
                type="password"
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B7B] mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
              />
            </div>
            <Button variant="primary">Atualizar Senha</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <h4 className="text-sm font-medium text-white">2FA via Aplicativo</h4>
              <p className="text-xs text-[#6B6B7B]">Use Google Authenticator ou similar</p>
            </div>
            <Button variant="secondary" size="sm">Configurar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { device: 'Chrome - Windows', location: 'São Paulo, BR', current: true },
              { device: 'Safari - iPhone', location: 'São Paulo, BR', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">{session.device}</p>
                  <p className="text-xs text-[#6B6B7B]">{session.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  {session.current && <Badge variant="success">Atual</Badge>}
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-400">
                      Encerrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
