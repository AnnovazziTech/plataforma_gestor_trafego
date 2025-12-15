'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatCompactNumber } from '@/lib/utils'
import { Target, DollarSign, Percent, ChevronDown, ArrowDownRight } from 'lucide-react'

interface FunnelStage {
  stage: string
  value: number
  percentage: number
}

interface ConversionFunnelProps {
  data: FunnelStage[]
}

const stageIcons = [
  { icon: Target, color: '#3B82F6' },
  { icon: Target, color: '#60A5FA' },
  { icon: Target, color: '#93C5FD' },
  { icon: Target, color: '#FACC15' },
  { icon: Target, color: '#FDE047' },
]

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const funnelData = data.length > 0 ? data : [
    { stage: 'Impressões', value: 0, percentage: 100 },
    { stage: 'Cliques', value: 0, percentage: 0 },
    { stage: 'Conversões', value: 0, percentage: 0 },
  ]
  const maxValue = funnelData[0]?.value || 1

  return (
    <Card variant="gradient" accentColor="yellow" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Funil de Conversao</CardTitle>
          <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', margin: 0 }}>Visualize a jornada do seu cliente</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B6B7B' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#3B82F6' }} />
            Inicio
          </span>
          <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#FACC15' }} />
            Conversao
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {funnelData.map((stage, index) => {
            const widthPercentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
            const dropOff = index > 0 && funnelData[index - 1].value > 0 ? ((1 - stage.value / funnelData[index - 1].value) * 100) : 0
            const stageConfig = stageIcons[index] || stageIcons[0]

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ position: 'relative' }}
              >
                {/* Drop-off connector */}
                {index > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                    }}
                  >
                    <ArrowDownRight size={10} style={{ color: '#F87171' }} />
                    <span style={{ color: '#F87171', fontWeight: 500 }}>
                      -{dropOff.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Stage Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    style={{
                      flexShrink: 0,
                      padding: '8px',
                      borderRadius: '12px',
                      backgroundColor: `${stageConfig.color}15`,
                    }}
                  >
                    <stageConfig.icon size={16} style={{ color: stageConfig.color }} />
                  </motion.div>

                  {/* Bar Container */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                        {stage.stage}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {formatCompactNumber(stage.value)}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            fontSize: '12px',
                            color: '#A0A0B0',
                          }}
                        >
                          {stage.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: '28px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          borderRadius: '8px',
                          position: 'relative',
                          overflow: 'hidden',
                          background: `linear-gradient(90deg, ${stageConfig.color} 0%, ${stageConfig.color}CC 100%)`,
                        }}
                      >
                        {/* Inner value indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: '8px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'rgba(255, 255, 255, 0.9)',
                            }}
                          >
                            {formatCompactNumber(stage.value)}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), transparent)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <Percent size={14} style={{ color: 'rgba(59, 130, 246, 0.5)' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6', marginBottom: '4px', margin: 0 }}>
                {funnelData.length > 1 && funnelData[1].value > 0
                  ? ((funnelData[funnelData.length - 1].value / funnelData[1].value) * 100).toFixed(2)
                  : '0.00'}%
              </p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Taxa de Conversao</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, rgba(96, 165, 250, 0.1), transparent)',
                border: '1px solid rgba(96, 165, 250, 0.2)',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <Target size={14} style={{ color: 'rgba(96, 165, 250, 0.5)' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#60A5FA', marginBottom: '4px', margin: 0 }}>
                {formatCompactNumber(funnelData[funnelData.length - 1]?.value || 0)}
              </p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Conversoes Totais</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, rgba(250, 204, 21, 0.1), transparent)',
                border: '1px solid rgba(250, 204, 21, 0.2)',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <DollarSign size={14} style={{ color: 'rgba(250, 204, 21, 0.5)' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#FACC15', marginBottom: '4px', margin: 0 }}>
                R$ 17,74
              </p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Custo por Conversao</p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
