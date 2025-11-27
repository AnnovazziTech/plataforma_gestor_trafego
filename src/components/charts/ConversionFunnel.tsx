'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { conversionFunnel } from '@/data/mock-data'
import { formatCompactNumber } from '@/lib/utils'
import { TrendingDown, Target, DollarSign, Percent, ChevronDown, ArrowDownRight } from 'lucide-react'

const stageIcons = [
  { icon: Target, color: '#3B82F6' },
  { icon: Target, color: '#60A5FA' },
  { icon: Target, color: '#93C5FD' },
  { icon: Target, color: '#FACC15' },
  { icon: Target, color: '#FDE047' },
]

export function ConversionFunnel() {
  const maxValue = conversionFunnel[0].value

  return (
    <Card variant="gradient" accentColor="yellow" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Funil de Conversão</CardTitle>
          <p className="text-xs text-[#6B6B7B] mt-1">Visualize a jornada do seu cliente</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            Início
          </span>
          <ChevronDown size={12} className="rotate-[-90deg]" />
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
            <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
            Conversão
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => {
            const widthPercentage = (stage.value / maxValue) * 100
            const dropOff = index > 0 ? ((1 - stage.value / conversionFunnel[index - 1].value) * 100) : 0
            const stageConfig = stageIcons[index] || stageIcons[0]

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Drop-off connector */}
                {index > 0 && (
                  <div className="absolute -top-3 left-8 flex items-center gap-1 text-xs">
                    <ArrowDownRight size={10} className="text-red-400" />
                    <span className="text-red-400 font-medium">
                      -{dropOff.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Stage Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className="flex-shrink-0 p-2 rounded-xl"
                    style={{ backgroundColor: `${stageConfig.color}15` }}
                  >
                    <stageConfig.icon size={16} style={{ color: stageConfig.color }} />
                  </motion.div>

                  {/* Bar Container */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white group-hover:text-[#3B82F6] transition-colors">
                        {stage.stage}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">
                          {formatCompactNumber(stage.value)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-[#A0A0B0]">
                          {stage.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-7 bg-white/5 rounded-lg overflow-hidden relative group-hover:bg-white/10 transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-lg relative overflow-hidden"
                        style={{
                          background: `linear-gradient(90deg,
                            ${stageConfig.color} 0%,
                            ${stageConfig.color}CC 100%
                          )`,
                        }}
                      >
                        {/* Inner value indicator */}
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <span className="text-xs font-semibold text-white/90 drop-shadow">
                            {formatCompactNumber(stage.value)}
                          </span>
                        </div>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-5 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 group hover:border-[#3B82F6]/40 transition-all"
            >
              <div className="absolute top-3 right-3">
                <Percent size={14} className="text-[#3B82F6]/50" />
              </div>
              <p className="text-2xl font-bold text-[#3B82F6] mb-1">
                {((conversionFunnel[conversionFunnel.length - 1].value / conversionFunnel[1].value) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-[#6B6B7B]">Taxa de Conversão</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-[#60A5FA]/10 to-transparent border border-[#60A5FA]/20 group hover:border-[#60A5FA]/40 transition-all"
            >
              <div className="absolute top-3 right-3">
                <Target size={14} className="text-[#60A5FA]/50" />
              </div>
              <p className="text-2xl font-bold text-[#60A5FA] mb-1">
                {formatCompactNumber(conversionFunnel[conversionFunnel.length - 1].value)}
              </p>
              <p className="text-xs text-[#6B6B7B]">Conversões Totais</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-[#FACC15]/10 to-transparent border border-[#FACC15]/20 group hover:border-[#FACC15]/40 transition-all"
            >
              <div className="absolute top-3 right-3">
                <DollarSign size={14} className="text-[#FACC15]/50" />
              </div>
              <p className="text-2xl font-bold text-[#FACC15] mb-1">
                R$ 17,74
              </p>
              <p className="text-xs text-[#6B6B7B]">Custo por Conversão</p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
