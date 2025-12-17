const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/social/page.tsx', 'utf8');

// 1. Update the name input in modal to be controlled
const oldNameInput = `<input
                    type="text"
                    placeholder="Ex: Post de Lançamento"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />`;
const newNameInput = `<input
                    type="text"
                    value={newPost.name}
                    onChange={(e) => setNewPost(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Post de Lançamento"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />`;
content = content.replace(oldNameInput, newNameInput);

// 2. Update platform buttons to be selectable
const oldPlatformButtons = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['instagram', 'facebook', 'linkedin', 'twitter'].map((platform) => {
                      const Icon = platformIcons[platform]
                      return (
                        <button
                          key={platform}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon size={20} style={{ color: '#6B6B7B' }} />
                          <span style={{ fontSize: '12px', color: '#6B6B7B', textTransform: 'capitalize' }}>{platform}</span>
                        </button>
                      )
                    })}
                  </div>`;
const newPlatformButtons = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['instagram', 'facebook', 'linkedin', 'twitter'].map((platform) => {
                      const Icon = platformIcons[platform]
                      const isSelected = newPost.platform === platform
                      const platformColors: Record<string, string> = {
                        instagram: '#E4405F',
                        facebook: '#1877F2',
                        linkedin: '#0A66C2',
                        twitter: '#1DA1F2',
                      }
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setNewPost(prev => ({ ...prev, platform: platform as any }))}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? \`\${platformColors[platform]}20\` : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? \`1px solid \${platformColors[platform]}\` : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon size={20} style={{ color: isSelected ? platformColors[platform] : '#6B6B7B' }} />
                          <span style={{ fontSize: '12px', color: isSelected ? platformColors[platform] : '#6B6B7B', textTransform: 'capitalize' }}>{platform}</span>
                        </button>
                      )
                    })}
                  </div>`;
content = content.replace(oldPlatformButtons, newPlatformButtons);

// 3. Update date input
const oldDateInput = `<input
                      type="date"
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Horário</label>
                    <input
                      type="time"
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />`;
const newDateInput = `<input
                      type="date"
                      value={newPost.date}
                      onChange={(e) => setNewPost(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Horário</label>
                    <input
                      type="time"
                      value={newPost.time}
                      onChange={(e) => setNewPost(prev => ({ ...prev, time: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />`;
content = content.replace(oldDateInput, newDateInput);

// 4. Update format buttons
const oldFormatButtons = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'feed', label: 'Feed', icon: Layout },
                      { id: 'story', label: 'Story', icon: Image },
                      { id: 'reels', label: 'Reels', icon: Film },
                    ].map((format) => (
                      <button
                        key={format.id}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <format.icon size={16} style={{ color: '#6B6B7B' }} />
                        <span style={{ fontSize: '14px', color: '#6B6B7B' }}>{format.label}</span>
                      </button>
                    ))}
                  </div>`;
const newFormatButtons = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'feed', label: 'Feed', icon: Layout },
                      { id: 'story', label: 'Story', icon: Image },
                      { id: 'reels', label: 'Reels', icon: Film },
                    ].map((format) => {
                      const isSelected = newPost.format === format.id
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setNewPost(prev => ({ ...prev, format: format.id as any }))}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <format.icon size={16} style={{ color: isSelected ? '#3B82F6' : '#6B6B7B' }} />
                          <span style={{ fontSize: '14px', color: isSelected ? '#3B82F6' : '#6B6B7B' }}>{format.label}</span>
                        </button>
                      )
                    })}
                  </div>`;
content = content.replace(oldFormatButtons, newFormatButtons);

// 5. Update textarea
const oldTextarea = `<textarea
                    rows={3}
                    placeholder="Digite o texto da sua postagem..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />`;
const newTextarea = `<textarea
                    rows={3}
                    value={newPost.text}
                    onChange={(e) => setNewPost(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Digite o texto da sua postagem..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />`;
content = content.replace(oldTextarea, newTextarea);

// 6. Update submit button
const oldSubmitButton = `<Button variant="primary" onClick={() => {
                  showToast('Post agendado com sucesso!', 'success')
                  setShowScheduleModal(false)
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    Agendar
                  </span>
                </Button>`;
const newSubmitButton = `<Button variant="primary" onClick={handleCreatePost} disabled={saving}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {saving ? (
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Calendar size={16} />
                    )}
                    {saving ? 'Agendando...' : 'Agendar'}
                  </span>
                </Button>`;
content = content.replace(oldSubmitButton, newSubmitButton);

// 7. Update delete button in the post card
const oldDeleteButton = `<button style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>`;
const newDeleteButton = `<button
                            onClick={() => handleDeletePost(post.id)}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>`;
content = content.replace(oldDeleteButton, newDeleteButton);

fs.writeFileSync('src/app/(app)/social/page.tsx', content);
console.log('Step 2 complete: Updated modal form controls');
