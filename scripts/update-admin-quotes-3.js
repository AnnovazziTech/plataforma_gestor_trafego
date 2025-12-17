const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/admin/page.tsx', 'utf8');

// Find the closing of the appointment modal and add the quote modal after it
const appointmentModalEnd = `      {/* Modal Novo Compromisso */}
      <AnimatePresence>
        {showAppointmentModal && (`;

// Find the end of the last modal (appointment modal) and add the quote modal
const lastModalClose = `                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}`;

const newLastModalClose = `                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Orçamento */}
      <AnimatePresence>
        {showQuoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuoteModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #FACC15, #EAB308)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#12121A' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Novo Orçamento</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Crie um orçamento para seu cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Client Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Selecionar Cliente *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name} - {client.email}</option>
                    ))}
                  </select>
                </div>

                {/* Services Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Adicionar Serviços
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {serviceTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => addServiceToQuote(template)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3B82F6',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={14} />
                        {template.name}
                      </button>
                    ))}
                  </div>

                  {/* Selected Services */}
                  {quoteServices.length > 0 && (
                    <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500 }}>Serviço</th>
                            <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '80px' }}>Qtd</th>
                            <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '120px' }}>Preço Unit.</th>
                            <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '120px' }}>Total</th>
                            <th style={{ padding: '12px', width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteServices.map(service => (
                            <tr key={service.id} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <td style={{ padding: '12px' }}>
                                <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{service.name}</p>
                                <p style={{ fontSize: '11px', color: '#6B6B7B', margin: 0 }}>{service.description}</p>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="1"
                                  value={service.quantity}
                                  onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value) || 1)}
                                  style={{
                                    width: '60px',
                                    height: '32px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={service.unitPrice}
                                  onChange={(e) => updateServicePrice(service.id, parseFloat(e.target.value) || 0)}
                                  style={{
                                    width: '100px',
                                    height: '32px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    textAlign: 'right',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>R$ {service.total.toLocaleString('pt-BR')}</span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  onClick={() => removeServiceFromQuote(service.id)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: 'none',
                                    color: '#EF4444',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Desconto
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quoteDiscount.value}
                      onChange={(e) => setQuoteDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Tipo de Desconto
                    </label>
                    <select
                      value={quoteDiscount.type}
                      onChange={(e) => setQuoteDiscount(prev => ({ ...prev, type: e.target.value as 'percent' | 'fixed' }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Validade (dias)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quoteValidDays}
                      onChange={(e) => setQuoteValidDays(parseInt(e.target.value) || 15)}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Notes and Payment Terms */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Observações
                    </label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Observações adicionais..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Condições de Pagamento
                    </label>
                    <textarea
                      value={quotePaymentTerms}
                      onChange={(e) => setQuotePaymentTerms(e.target.value)}
                      placeholder="Ex: Pagamento à vista ou parcelado em 3x"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Total Summary */}
                {quoteServices.length > 0 && (
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#A0A0B0' }}>Subtotal:</span>
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>R$ {calculateQuoteTotal().subtotal.toLocaleString('pt-BR')}</span>
                    </div>
                    {quoteDiscount.value > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#A0A0B0' }}>Desconto ({quoteDiscount.type === 'percent' ? \`\${quoteDiscount.value}%\` : \`R$ \${quoteDiscount.value}\`}):</span>
                        <span style={{ fontSize: '14px', color: '#EF4444' }}>- R$ {calculateQuoteTotal().discount.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>Total:</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#3B82F6' }}>R$ {calculateQuoteTotal().total.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowQuoteModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleCreateQuote} style={{ flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} />
                      Criar Orçamento
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}`;

content = content.replace(lastModalClose, newLastModalClose);

fs.writeFileSync('src/app/(app)/admin/page.tsx', content);
console.log('Step 3 complete: Added quote creation modal');
