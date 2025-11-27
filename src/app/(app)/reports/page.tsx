'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PlatformIcon } from '@/components/ui'
import { reports } from '@/data/mock-data'
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  Users,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Eye,
  Share2,
  Copy,
  Check,
} from 'lucide-react'
import { Report, Platform } from '@/types'

const reportTypeLabels: Record<string, string> = {
  performance: 'Performance',
  audience: 'Audiência',
  creative: 'Criativos',
  custom: 'Personalizado',
}

const reportTypeIcons: Record<string, ReactNode> = {
  performance: <BarChart3 size={18} />,
  audience: <Users size={18} />,
  creative: <PieChart size={18} />,
  custom: <Target size={18} />,
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizado',
}

export default function ReportsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen">
      <Header
        title="Relatórios"
        subtitle="Crie e gerencie relatórios automatizados"
      />

      <main className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Relatórios Ativos', value: reports.filter(r => r.status === 'active').length, icon: FileText, color: 'blue' },
            { label: 'Gerados Este Mês', value: 24, icon: Download, color: 'yellow' },
            { label: 'Destinatários', value: 8, icon: Mail, color: 'blue' },
            { label: 'Próxima Geração', value: 'Em 2h', icon: Clock, color: 'yellow' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 hover:border-[#3B82F6]/30 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl mb-3 ${stat.color === 'blue' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#FACC15]/10 text-[#FACC15]'}`}>
                  <stat.icon size={22} />
                </div>
                <p className="text-sm text-[#A0A0B0] mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Meus Relatórios</h2>
          <Button variant="primary" className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Novo Relatório
          </Button>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => (
            <ReportCard key={report.id} report={report} index={index} />
          ))}

          {/* Create New Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reports.length * 0.1 }}
            onClick={() => setShowCreateModal(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#3B82F6]/30 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group min-h-[280px]"
          >
            <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#3B82F6]/10 transition-colors">
              <Plus size={24} className="text-[#6B6B7B] group-hover:text-[#3B82F6] transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-1">Criar Novo Relatório</p>
              <p className="text-xs text-[#6B6B7B]">Configure relatórios automáticos</p>
            </div>
          </motion.div>
        </div>

        {/* Report Templates */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-6">Templates Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Performance Semanal', description: 'Métricas de performance completas', icon: TrendingUp, color: 'blue' },
              { name: 'Análise de Audiência', description: 'Demografia e comportamento', icon: Users, color: 'blue' },
              { name: 'ROI por Plataforma', description: 'Comparativo de retorno', icon: BarChart3, color: 'yellow' },
              { name: 'Criativos Top', description: 'Melhores anúncios e copies', icon: Eye, color: 'yellow' },
            ].map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 cursor-pointer transition-all group"
              >
                <div className={`p-3 rounded-xl mb-4 w-fit ${
                  template.color === 'blue' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#FACC15]/10 text-[#FACC15]'
                }`}>
                  <template.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#3B82F6] transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-[#6B6B7B]">{template.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function ReportCard({ report, index }: { report: Report; index: number }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            report.type === 'performance' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
            report.type === 'audience' ? 'bg-[#60A5FA]/10 text-[#60A5FA]' :
            report.type === 'creative' ? 'bg-[#FACC15]/10 text-[#FACC15]' :
            'bg-[#FDE047]/10 text-[#FDE047]'
          }`}>
            {reportTypeIcons[report.type]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
              {report.name}
            </h3>
            <p className="text-xs text-[#6B6B7B]">{reportTypeLabels[report.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={report.status === 'active' ? 'success' : 'warning'}>
            {report.status === 'active' ? 'Ativo' : 'Pausado'}
          </Badge>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                >
                  {[
                    { icon: Edit, label: 'Editar' },
                    { icon: Download, label: 'Baixar' },
                    { icon: Share2, label: 'Compartilhar' },
                    { icon: report.status === 'active' ? Pause : Play, label: report.status === 'active' ? 'Pausar' : 'Ativar' },
                    { icon: Trash2, label: 'Excluir', danger: true },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${action.danger ? 'text-red-400' : 'text-[#A0A0B0]'}`}
                    >
                      <action.icon size={14} />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Clock size={12} />
          <span>Frequência: {frequencyLabels[report.frequency]}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Calendar size={12} />
          <span>
            {new Date(report.dateRange.start).toLocaleDateString('pt-BR')} - {new Date(report.dateRange.end).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Mail size={12} />
          <span>{report.recipients.length} destinatário(s)</span>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex items-center gap-2 mb-4">
        {report.platforms.map((platform) => (
          <div key={platform} className="p-1.5 rounded-lg bg-white/5">
            <PlatformIcon platform={platform} size={14} />
          </div>
        ))}
      </div>

      {/* Last Generated */}
      {report.lastGenerated && (
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6B7B]">Última geração</span>
            <span className="text-xs text-white">
              {new Date(report.lastGenerated).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="secondary" size="sm" className="flex-1 gap-1.5">
          <Download size={14} />
          Baixar
        </Button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </motion.div>
  )
}
