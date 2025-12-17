const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/admin/page.tsx', 'utf8');

// Replace the budget tab content
const oldBudgetTab = `{activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Controle de Orçamento dos Clientes</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {connectedAccounts.filter(a => a.connected).map((account, idx) => {
                  const dailyBudget = 150 + idx * 50
                  const totalSpent = dailyBudget * 15
                  const totalBudget = dailyBudget * 30
                  const progress = (totalSpent / totalBudget) * 100

                  return (
                    <div
                      key={account.id}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <Target size={18} style={{ color: '#3B82F6' }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{account.name}</h3>
                            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Conectado em {account.connectedAt}</p>
                          </div>
                        </div>
                        <Badge variant="success">Ativo</Badge>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Orçamento Diário</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>R$ {dailyBudget}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Gasto Total</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FACC15', margin: 0 }}>R$ {totalSpent.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Orçamento Disponível</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>R$ {totalBudget.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Finalizará em:</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#3B82F6', margin: 0 }}>15 dias</p>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                          <span style={{ color: '#6B6B7B' }}>Progresso do Orçamento</span>
                          <span style={{ color: '#FFFFFF' }}>{progress.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: \`\${progress}%\` }}
                            transition={{ duration: 1 }}
                            style={{
                              height: '100%',
                              borderRadius: '9999px',
                              backgroundColor: progress > 80 ? '#EF4444' : progress > 50 ? '#FACC15' : '#3B82F6',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {connectedAccounts.filter(a => a.connected).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Target size={32} style={{ color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhuma conta conectada</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Conecte suas contas de anúncios para ver o controle de orçamento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}`;

const newBudgetTab = `{activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Total de Orçamentos</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{quotes.length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Aceitos</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>{quotes.filter(q => q.status === 'accepted').length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Pendentes</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#FACC15', margin: 0 }}>{quotes.filter(q => ['sent', 'viewed', 'draft'].includes(q.status)).length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Valor Total Aceito</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>R$ {quotes.filter(q => q.status === 'accepted').reduce((acc, q) => acc + q.total, 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Meus Orçamentos</h2>
                <Button variant="primary" onClick={() => { resetQuoteForm(); setShowQuoteModal(true); }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Novo Orçamento
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quotes.map((quote, index) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'linear-gradient(to bottom right, #FACC15, #EAB308)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <FileText size={20} style={{ color: '#12121A' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{quote.number}</h3>
                            <Badge variant={getQuoteStatusVariant(quote.status)}>{getQuoteStatusLabel(quote.status)}</Badge>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Building2 size={12} />
                              {quote.client.name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Mail size={12} />
                              {quote.client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>R$ {quote.total.toLocaleString('pt-BR')}</p>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Válido até {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Services summary */}
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Serviços incluídos:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {quote.services.map((service, idx) => (
                          <span key={idx} style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', fontSize: '11px', color: '#3B82F6' }}>
                            {service.name} {service.quantity > 1 ? \`x\${service.quantity}\` : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                          Criado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {quote.sentAt && (
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                            | Enviado em {new Date(quote.sentAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => showToast('PDF gerado! (funcionalidade em desenvolvimento)', 'info')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleSendQuote(quote, 'email')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: 'none', color: '#10B981', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Mail size={14} />
                          Email
                        </button>
                        <button
                          onClick={() => handleSendQuote(quote, 'whatsapp')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(37, 211, 102, 0.1)', border: 'none', color: '#25D366', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {quotes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText size={32} style={{ color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhum orçamento criado</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Crie seu primeiro orçamento clicando no botão acima</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}`;

content = content.replace(oldBudgetTab, newBudgetTab);

fs.writeFileSync('src/app/(app)/admin/page.tsx', content);
console.log('Step 2 complete: Updated budget tab with quote listing');
