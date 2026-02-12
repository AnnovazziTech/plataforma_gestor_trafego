'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
  assets: number
  balance: number
}

interface Props {
  data: ChartDataPoint[]
}

type FilterType = 'all' | 'income' | 'expenses' | 'assets'

const COLORS = {
  income: '#10B981',
  expenses: '#EF4444',
  assets: '#3B82F6',
} as const

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'income', label: 'Receitas' },
  { key: 'expenses', label: 'Despesas' },
  { key: 'assets', label: 'Patrimônio' },
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Build a smooth SVG path using monotone cubic interpolation (similar to d3's curveMonotoneX).
 * This avoids overshooting and produces visually clean curves for financial data.
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  if (points.length === 2) {
    return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`
  }

  // Compute tangents using finite differences (Fritsch-Carlson style)
  const n = points.length
  const dx: number[] = []
  const dy: number[] = []
  const slopes: number[] = []

  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x)
    dy.push(points[i + 1].y - points[i].y)
    slopes.push(dy[i] / dx[i])
  }

  // Compute tangent at each point
  const tangents: number[] = new Array(n)
  tangents[0] = slopes[0]
  tangents[n - 1] = slopes[n - 2]

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0
    } else {
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2
    }
  }

  // Build cubic bezier segments
  let path = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < n - 1; i++) {
    const segDx = dx[i] / 3
    const cp1x = points[i].x + segDx
    const cp1y = points[i].y + tangents[i] * segDx
    const cp2x = points[i + 1].x - segDx
    const cp2y = points[i + 1].y - tangents[i + 1] * segDx
    path += `C${cp1x},${cp1y},${cp2x},${cp2y},${points[i + 1].x},${points[i + 1].y}`
  }

  return path
}

export function FinanceChart({ data }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    dataIndex: number
  }>({ visible: false, x: 0, y: 0, dataIndex: 0 })
  const [svgWidth, setSvgWidth] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  // Responsive width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateWidth = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        setSvgWidth(rect.width)
      }
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
        Sem dados para exibir
      </div>
    )
  }

  // Chart dimensions
  const PADDING_LEFT = 60
  const PADDING_RIGHT = 20
  const PADDING_TOP = 20
  const PADDING_BOTTOM = 30
  const CHART_HEIGHT = 220
  const chartInnerWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT
  const chartInnerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

  // Determine visible series
  const showIncome = activeFilter === 'all' || activeFilter === 'income'
  const showExpenses = activeFilter === 'all' || activeFilter === 'expenses'
  const showAssets = activeFilter === 'all' || activeFilter === 'assets'

  // Compute max value from visible series only
  const visibleValues = data.flatMap(d => {
    const vals: number[] = []
    if (showIncome) vals.push(d.income)
    if (showExpenses) vals.push(d.expenses)
    if (showAssets) vals.push(d.assets)
    return vals
  })
  const maxValue = Math.max(...visibleValues, 0)
  const niceMax = maxValue > 0 ? Math.ceil(maxValue / 1000) * 1000 : 1000

  // Helper to convert data point to SVG coordinates
  const getX = (index: number) => {
    if (data.length === 1) return PADDING_LEFT + chartInnerWidth / 2
    return PADDING_LEFT + (index / (data.length - 1)) * chartInnerWidth
  }

  const getY = (value: number) => {
    return PADDING_TOP + chartInnerHeight - (value / niceMax) * chartInnerHeight
  }

  // Build line data for each series
  const incomePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.income) }))
  const expensesPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.expenses) }))
  const assetsPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.assets) }))

  const incomePath = buildSmoothPath(incomePoints)
  const expensesPath = buildSmoothPath(expensesPoints)
  const assetsPath = buildSmoothPath(assetsPoints)

  // Y-axis ticks (5 levels)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = (niceMax / 4) * i
    return { value, y: getY(value) }
  })

  // Handle hover on invisible hit areas for each data point
  const handleMouseEnter = useCallback(
    (index: number, x: number, y: number) => {
      setTooltip({ visible: true, x, y, dataIndex: index })
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  const tooltipData = tooltip.visible ? data[tooltip.dataIndex] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: '#12121A',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#FFF',
          marginBottom: '16px',
        }}
      >
        Evolução Financeira
      </h3>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter.key
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#FFF' : '#6B6B7B',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {[
          { label: 'Receita', color: COLORS.income, visible: showIncome },
          { label: 'Despesas', color: COLORS.expenses, visible: showExpenses },
          { label: 'Patrimônio', color: COLORS.assets, visible: showAssets },
        ]
          .filter(item => item.visible)
          .map(item => (
            <div
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: item.color,
                }}
              />
              <span style={{ fontSize: '12px', color: '#A0A0B0' }}>{item.label}</span>
            </div>
          ))}
      </div>

      {/* SVG Line Chart */}
      <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
        <svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines and Y-axis labels */}
          {yTicks.map(tick => (
            <g key={tick.value}>
              <line
                x1={PADDING_LEFT}
                y1={tick.y}
                x2={svgWidth - PADDING_RIGHT}
                y2={tick.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
              <text
                x={PADDING_LEFT - 8}
                y={tick.y + 4}
                textAnchor="end"
                fill="#6B6B7B"
                fontSize={10}
              >
                {tick.value >= 1000
                  ? `${(tick.value / 1000).toFixed(0)}k`
                  : tick.value.toFixed(0)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((point, i) => (
            <text
              key={i}
              x={getX(i)}
              y={CHART_HEIGHT - 4}
              textAnchor="middle"
              fill="#6B6B7B"
              fontSize={11}
            >
              {point.month}
            </text>
          ))}

          {/* Gradient definitions for area fills */}
          <defs>
            <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.income} stopOpacity={0.15} />
              <stop offset="100%" stopColor={COLORS.income} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-expenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.expenses} stopOpacity={0.15} />
              <stop offset="100%" stopColor={COLORS.expenses} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-assets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.assets} stopOpacity={0.15} />
              <stop offset="100%" stopColor={COLORS.assets} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area fills */}
          {showIncome && incomePoints.length > 1 && (
            <path
              d={`${incomePath}L${incomePoints[incomePoints.length - 1].x},${getY(0)}L${incomePoints[0].x},${getY(0)}Z`}
              fill="url(#grad-income)"
            />
          )}
          {showExpenses && expensesPoints.length > 1 && (
            <path
              d={`${expensesPath}L${expensesPoints[expensesPoints.length - 1].x},${getY(0)}L${expensesPoints[0].x},${getY(0)}Z`}
              fill="url(#grad-expenses)"
            />
          )}
          {showAssets && assetsPoints.length > 1 && (
            <path
              d={`${assetsPath}L${assetsPoints[assetsPoints.length - 1].x},${getY(0)}L${assetsPoints[0].x},${getY(0)}Z`}
              fill="url(#grad-assets)"
            />
          )}

          {/* Lines */}
          {showIncome && (
            <path
              d={incomePath}
              fill="none"
              stroke={COLORS.income}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {showExpenses && (
            <path
              d={expensesPath}
              fill="none"
              stroke={COLORS.expenses}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {showAssets && (
            <path
              d={assetsPath}
              fill="none"
              stroke={COLORS.assets}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data point dots */}
          {showIncome &&
            incomePoints.map((pt, i) => (
              <circle
                key={`inc-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={tooltip.visible && tooltip.dataIndex === i ? 5 : 3.5}
                fill={COLORS.income}
                stroke="#12121A"
                strokeWidth={2}
                style={{ transition: 'r 0.15s ease' }}
              />
            ))}
          {showExpenses &&
            expensesPoints.map((pt, i) => (
              <circle
                key={`exp-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={tooltip.visible && tooltip.dataIndex === i ? 5 : 3.5}
                fill={COLORS.expenses}
                stroke="#12121A"
                strokeWidth={2}
                style={{ transition: 'r 0.15s ease' }}
              />
            ))}
          {showAssets &&
            assetsPoints.map((pt, i) => (
              <circle
                key={`ast-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={tooltip.visible && tooltip.dataIndex === i ? 5 : 3.5}
                fill={COLORS.assets}
                stroke="#12121A"
                strokeWidth={2}
                style={{ transition: 'r 0.15s ease' }}
              />
            ))}

          {/* Vertical hover indicator line */}
          {tooltip.visible && (
            <line
              x1={getX(tooltip.dataIndex)}
              y1={PADDING_TOP}
              x2={getX(tooltip.dataIndex)}
              y2={PADDING_TOP + chartInnerHeight}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          )}

          {/* Invisible hit areas for hover detection */}
          {data.map((_, i) => {
            const hitWidth =
              data.length > 1 ? chartInnerWidth / (data.length - 1) : chartInnerWidth
            const x = getX(i)

            // Determine the topmost visible point for tooltip positioning
            const visibleYs: number[] = []
            if (showIncome) visibleYs.push(incomePoints[i].y)
            if (showExpenses) visibleYs.push(expensesPoints[i].y)
            if (showAssets) visibleYs.push(assetsPoints[i].y)
            const topY = visibleYs.length > 0 ? Math.min(...visibleYs) : PADDING_TOP

            return (
              <rect
                key={`hit-${i}`}
                x={x - hitWidth / 2}
                y={PADDING_TOP}
                width={hitWidth}
                height={chartInnerHeight}
                fill="transparent"
                onMouseEnter={() => handleMouseEnter(i, x, topY)}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'crosshair' }}
              />
            )
          })}
        </svg>

        {/* Tooltip overlay */}
        {tooltip.visible && tooltipData && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y - 12,
              transform: `translate(${
                tooltip.x > svgWidth * 0.7 ? '-100%' : tooltip.x < svgWidth * 0.3 ? '0%' : '-50%'
              }, -100%)`,
              backgroundColor: 'rgba(20, 20, 32, 0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              minWidth: '160px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFF',
                marginBottom: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '6px',
              }}
            >
              {tooltipData.month}
            </div>
            {showIncome && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: COLORS.income,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#A0A0B0' }}>Receita</span>
                </span>
                <span style={{ fontSize: '12px', color: COLORS.income, fontWeight: 500 }}>
                  {formatBRL(tooltipData.income)}
                </span>
              </div>
            )}
            {showExpenses && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: COLORS.expenses,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#A0A0B0' }}>Despesas</span>
                </span>
                <span style={{ fontSize: '12px', color: COLORS.expenses, fontWeight: 500 }}>
                  {formatBRL(tooltipData.expenses)}
                </span>
              </div>
            )}
            {showAssets && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: COLORS.assets,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#A0A0B0' }}>Patrimônio</span>
                </span>
                <span style={{ fontSize: '12px', color: COLORS.assets, fontWeight: 500 }}>
                  {formatBRL(tooltipData.assets)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
