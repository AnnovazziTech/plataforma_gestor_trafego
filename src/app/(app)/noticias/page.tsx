'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, User, Loader2 } from 'lucide-react'

export default function NoticiasPage() {
  const { newsPosts, newsPostsLoading, fetchNewsPosts } = useApp()

  useEffect(() => {
    fetchNewsPosts()
  }, [fetchNewsPosts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Notícias" subtitle="Fique por dentro das novidades" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {newsPostsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
            <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : newsPosts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            borderRadius: '16px', backgroundColor: '#12121A',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Newspaper size={48} style={{ color: '#6B6B7B', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
              Nenhuma notícia publicada
            </h3>
            <p style={{ color: '#6B6B7B', fontSize: '14px' }}>
              As notícias serão exibidas aqui quando publicadas pelo administrador.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {newsPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  borderRadius: '16px', overflow: 'hidden',
                  backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {post.imageUrl && (
                  <div style={{
                    width: '100%', height: '200px',
                    backgroundImage: `url(${post.imageUrl})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }} />
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#A0A0B0', lineHeight: 1.6, marginBottom: '16px' }}>
                    {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B6B7B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {post.author && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {post.author.name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
