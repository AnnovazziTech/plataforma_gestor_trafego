'use client'

import { useState, ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  pageSize?: number
  showPagination?: boolean
  emptyMessage?: string
  emptyIcon?: ReactNode
  variant?: 'default' | 'compact' | 'striped'
  stickyHeader?: boolean
  maxHeight?: string
  loading?: boolean
  actions?: (row: T) => ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  pageSize = 10,
  showPagination = true,
  emptyMessage = 'Nenhum dado encontrado',
  emptyIcon,
  variant = 'default',
  stickyHeader = false,
  maxHeight,
  loading = false,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = searchable && searchTerm
    ? data.filter(row =>
        searchKeys.some(key =>
          String(row[key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data

  // Sort data
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortKey as keyof T]
        const bVal = b[sortKey as keyof T]
        if (aVal == null || bVal == null) return 0
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = showPagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData

  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const cellPadding = variant === 'compact' ? '10px 12px' : '16px'

  return (
    <div style={{ width: '100%' }}>
      {/* Search Bar */}
      {searchable && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#6B6B7B',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '40px',
                paddingRight: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                color: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          backgroundColor: 'rgba(18, 18, 26, 0.6)',
          maxHeight: maxHeight || undefined,
          overflowY: maxHeight ? 'auto' : undefined,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Header */}
          <thead
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              position: stickyHeader ? 'sticky' : undefined,
              top: stickyHeader ? 0 : undefined,
              zIndex: stickyHeader ? 10 : undefined,
            }}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6B6B7B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: column.align || 'left',
                    width: column.width || undefined,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: column.sortable ? 'none' : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {sortDirection === 'asc' ? (
                          <ChevronUp size={14} style={{ color: '#3B82F6' }} />
                        ) : (
                          <ChevronDown size={14} style={{ color: '#3B82F6' }} />
                        )}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th style={{ width: '48px', padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }} />
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {columns.map((column, j) => (
                      <td key={`skeleton-${i}-${j}`} style={{ padding: cellPadding }}>
                        <div
                          style={{
                            height: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '48px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      {emptyIcon && (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                          }}
                        >
                          {emptyIcon}
                        </div>
                      )}
                      <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: variant === 'striped' && rowIndex % 2 === 1 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        style={{
                          padding: cellPadding,
                          fontSize: '14px',
                          textAlign: column.align || 'left',
                        }}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : <span style={{ color: '#A0A0B0' }}>{String(row[column.key as keyof T] ?? '-')}</span>
                        }
                      </td>
                    ))}
                    {actions && (
                      <td style={{ padding: cellPadding, textAlign: 'center' }}>
                        {actions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            padding: '0 8px',
          }}
        >
          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: currentPage === 1 ? '#4B4B5B' : '#6B6B7B',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: currentPage === pageNum ? '#3B82F6' : 'transparent',
                      color: currentPage === pageNum ? '#FFFFFF' : '#6B6B7B',
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: currentPage === totalPages ? '#4B4B5B' : '#6B6B7B',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
