'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { conversionFunnel } from '@/data/mock-data'
import { formatCompactNumber } from '@/lib/utils'

export function ConversionFunnel() {
  const maxValue = conversionFunnel[0].value

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => {
            const widthPercentage = (stage.value / maxValue) * 100

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      {formatCompactNumber(stage.value)}
                    </span>
                    <span className="text-xs text-[#6B6B7B] w-12 text-right">
                      {stage.percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
                    className="h-full rounded-lg relative overflow-hidden"
                    style={{
                      background: `linear-gradient(90deg,
                        rgba(0, 245, 255, ${0.8 - index * 0.1}) 0%,
                        rgba(191, 0, 255, ${0.8 - index * 0.1}) 50%,
                        rgba(255, 0, 229, ${0.8 - index * 0.1}) 100%
                      )`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>

                {/* Drop-off indicator */}
                {index > 0 && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs text-red-400">
                      -{ ((1 - stage.value / conversionFunnel[index - 1].value) * 100).toFixed(1) }%
                    </span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold gradient-text">
                {((conversionFunnel[conversionFunnel.length - 1].value / conversionFunnel[1].value) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-[#6B6B7B]">Taxa de Conversão</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00FF88]">
                {formatCompactNumber(conversionFunnel[conversionFunnel.length - 1].value)}
              </p>
              <p className="text-xs text-[#6B6B7B]">Conversões Totais</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#FFE500]">
                R$ 17,74
              </p>
              <p className="text-xs text-[#6B6B7B]">Custo por Conversão</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
