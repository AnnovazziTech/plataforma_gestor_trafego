const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/social/page.tsx', 'utf8');

// 1. Update imports to add useEffect
const oldImports = `import { useState } from 'react'`;
const newImports = `import { useState, useEffect, useCallback } from 'react'`;
content = content.replace(oldImports, newImports);

// 2. Remove mock data and add state for form
const oldMockData = `const mockPosts: ScheduledPost[] = [
  { id: '1', name: 'Lançamento Produto', platform: 'instagram', date: '2024-02-20', time: '10:00', format: 'feed', text: 'Novidade chegando!', status: 'scheduled' },
  { id: '2', name: 'Dica do Dia', platform: 'facebook', date: '2024-02-21', time: '14:30', format: 'feed', text: 'Dica importante para seu negócio...', status: 'scheduled' },
  { id: '3', name: 'Bastidores', platform: 'instagram', date: '2024-02-19', time: '18:00', format: 'story', text: 'Por trás das câmeras', status: 'published' },
]`;
const newMockData = `// Posts are now fetched from API`;
content = content.replace(oldMockData, newMockData);

// 3. Update state initialization to empty array and add form state
const oldStateInit = `const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(mockPosts)
  const [showScheduleModal, setShowScheduleModal] = useState(false)`;
const newStateInit = `const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [postStats, setPostStats] = useState({ total: 0, scheduled: 0, published: 0, failed: 0 })

  // Form state
  const [newPost, setNewPost] = useState({
    name: '',
    platform: 'instagram' as 'instagram' | 'facebook' | 'linkedin' | 'twitter',
    date: '',
    time: '',
    format: 'feed' as 'feed' | 'story' | 'reels',
    text: '',
  })

  // Fetch scheduled posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scheduled-posts')
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data.posts || [])
        setPostStats(data.stats || { total: 0, scheduled: 0, published: 0, failed: 0 })
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Create new scheduled post
  const handleCreatePost = async () => {
    if (!newPost.name.trim()) {
      showToast('Digite o nome da programação', 'error')
      return
    }
    if (!newPost.date) {
      showToast('Selecione uma data', 'error')
      return
    }
    if (!newPost.time) {
      showToast('Selecione um horário', 'error')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPost.name,
          platform: newPost.platform.toUpperCase(),
          date: newPost.date,
          time: newPost.time,
          format: newPost.format.toUpperCase(),
          text: newPost.text,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(prev => [data.post, ...prev])
        setShowScheduleModal(false)
        setNewPost({ name: '', platform: 'instagram', date: '', time: '', format: 'feed', text: '' })
        showToast('Post agendado com sucesso!', 'success')
        fetchPosts() // Refresh to get updated stats
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao agendar post', 'error')
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
      showToast('Erro ao agendar post', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete scheduled post
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(\`/api/scheduled-posts/\${postId}\`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setScheduledPosts(prev => prev.filter(p => p.id !== postId))
        showToast('Post removido com sucesso', 'success')
        fetchPosts() // Refresh stats
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao remover post', 'error')
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      showToast('Erro ao remover post', 'error')
    }
  }`;
content = content.replace(oldStateInit, newStateInit);

// 4. Update StatCard for scheduled posts to use postStats
const oldStatCard = `<StatCard
            label="Posts Agendados"
            value={scheduledPosts.filter(p => p.status === 'scheduled').length}
            icon={Calendar}
            color="yellow"
            delay={0.3}
          />`;
const newStatCard = `<StatCard
            label="Posts Agendados"
            value={postStats.scheduled}
            icon={Calendar}
            color="yellow"
            delay={0.3}
          />`;
content = content.replace(oldStatCard, newStatCard);

fs.writeFileSync('src/app/(app)/social/page.tsx', content);
console.log('Step 1 complete: Updated state and API integration');
