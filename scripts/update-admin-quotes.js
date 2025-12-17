const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/admin/page.tsx', 'utf8');

// 1. Add imports for Quote types
const oldImports = `import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Circle,
  Timer,
  X,
  Bell,
  Target,
  Wallet,
  PiggyBank,
  Receipt,
  Play,
  Pause,
  Square,
  UserPlus,
} from 'lucide-react'`;

const newImports = `import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Circle,
  Timer,
  X,
  Bell,
  Target,
  Wallet,
  PiggyBank,
  Receipt,
  Play,
  Pause,
  Square,
  UserPlus,
  Send,
  Eye,
  Download,
  Copy,
  MessageCircle,
  DollarSign,
  Percent,
  Building2,
} from 'lucide-react'
import { Quote, QuoteService, QuoteStatus, ServiceTemplate } from '@/types'`;

content = content.replace(oldImports, newImports);

// 2. Add mock service templates and quotes after mockExpenses
const mockExpensesEnd = `const mockExpenses: Expense[] = [
  { id: '1', description: 'Ferramentas de Marketing', amount: 299, category: 'Software', date: '2024-01-15' },
  { id: '2', description: 'Assinatura Semrush', amount: 499, category: 'Software', date: '2024-01-10' },
  { id: '3', description: 'Curso de Tráfego', amount: 1997, category: 'Educação', date: '2024-01-05' },
]`;

const mockExpensesNew = `const mockExpenses: Expense[] = [
  { id: '1', description: 'Ferramentas de Marketing', amount: 299, category: 'Software', date: '2024-01-15' },
  { id: '2', description: 'Assinatura Semrush', amount: 499, category: 'Software', date: '2024-01-10' },
  { id: '3', description: 'Curso de Tráfego', amount: 1997, category: 'Educação', date: '2024-01-05' },
]

const serviceTemplates: ServiceTemplate[] = [
  { id: '1', name: 'Gestão de Tráfego - Meta Ads', description: 'Gerenciamento completo de campanhas no Facebook e Instagram', defaultPrice: 1500, category: 'Gestão' },
  { id: '2', name: 'Gestão de Tráfego - Google Ads', description: 'Gerenciamento completo de campanhas no Google', defaultPrice: 1500, category: 'Gestão' },
  { id: '3', name: 'Criação de Criativos', description: 'Design de peças publicitárias para campanhas', defaultPrice: 500, category: 'Criativo' },
  { id: '4', name: 'Consultoria de Marketing', description: 'Análise estratégica e planejamento de marketing digital', defaultPrice: 800, category: 'Consultoria' },
  { id: '5', name: 'Relatório de Performance', description: 'Relatório detalhado mensal de resultados', defaultPrice: 300, category: 'Relatório' },
  { id: '6', name: 'Setup de Pixel/Conversões', description: 'Configuração completa de rastreamento', defaultPrice: 400, category: 'Técnico' },
]

const mockQuotes: Quote[] = [
  {
    id: '1',
    number: 'ORC-2024-001',
    client: { name: 'Empresa ABC', email: 'contato@abc.com', phone: '(11) 99999-1234', company: 'ABC Ltda' },
    services: [
      { id: '1', name: 'Gestão de Tráfego - Meta Ads', description: 'Gestão mensal', quantity: 1, unitPrice: 1500, total: 1500 },
      { id: '2', name: 'Criação de Criativos', description: '10 peças', quantity: 10, unitPrice: 50, total: 500 },
    ],
    subtotal: 2000,
    discount: 10,
    discountType: 'percent',
    total: 1800,
    validUntil: '2024-02-15',
    notes: 'Proposta válida por 15 dias',
    paymentTerms: 'Pagamento à vista ou parcelado em 3x',
    status: 'sent',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sentAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '2',
    number: 'ORC-2024-002',
    client: { name: 'Loja XYZ', email: 'loja@xyz.com', phone: '(11) 98888-5678', company: 'XYZ Comércio' },
    services: [
      { id: '1', name: 'Gestão de Tráfego - Google Ads', description: 'Gestão mensal', quantity: 1, unitPrice: 1500, total: 1500 },
    ],
    subtotal: 1500,
    discount: 0,
    discountType: 'fixed',
    total: 1500,
    validUntil: '2024-02-20',
    status: 'accepted',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    sentAt: '2024-01-20T10:00:00Z',
    viewedAt: '2024-01-21T08:00:00Z',
    respondedAt: '2024-01-22T11:00:00Z',
  },
  {
    id: '3',
    number: 'ORC-2024-003',
    client: { name: 'Tech Solutions', email: 'tech@solutions.com', phone: '(11) 97777-9012' },
    services: [
      { id: '1', name: 'Gestão de Tráfego - Meta Ads', description: 'Gestão mensal', quantity: 1, unitPrice: 1500, total: 1500 },
      { id: '2', name: 'Gestão de Tráfego - Google Ads', description: 'Gestão mensal', quantity: 1, unitPrice: 1500, total: 1500 },
      { id: '3', name: 'Consultoria de Marketing', description: 'Sessão inicial', quantity: 2, unitPrice: 800, total: 1600 },
    ],
    subtotal: 4600,
    discount: 500,
    discountType: 'fixed',
    total: 4100,
    validUntil: '2024-01-25',
    status: 'draft',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z',
  },
]`;

content = content.replace(mockExpensesEnd, mockExpensesNew);

// 3. Add state for quotes after showAppointmentModal state
const afterAppointmentModal = `const [showAppointmentModal, setShowAppointmentModal] = useState(false)`;
const afterAppointmentModalNew = `const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [quoteServices, setQuoteServices] = useState<QuoteService[]>([])
  const [quoteDiscount, setQuoteDiscount] = useState({ value: 0, type: 'percent' as 'percent' | 'fixed' })
  const [quoteNotes, setQuoteNotes] = useState('')
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('')
  const [quoteValidDays, setQuoteValidDays] = useState(15)`;

content = content.replace(afterAppointmentModal, afterAppointmentModalNew);

// 4. Add helper functions before handleAddAppointment
const beforeHandleAddAppointment = `const handleAddAppointment = () => {`;
const beforeHandleAddAppointmentNew = `// Quote helper functions
  const getQuoteStatusLabel = (status: QuoteStatus) => {
    const labels: Record<QuoteStatus, string> = {
      draft: 'Rascunho',
      sent: 'Enviado',
      viewed: 'Visualizado',
      accepted: 'Aceito',
      rejected: 'Rejeitado',
      expired: 'Expirado',
    }
    return labels[status]
  }

  const getQuoteStatusVariant = (status: QuoteStatus): 'default' | 'warning' | 'success' | 'error' => {
    const variants: Record<QuoteStatus, 'default' | 'warning' | 'success' | 'error'> = {
      draft: 'default',
      sent: 'warning',
      viewed: 'warning',
      accepted: 'success',
      rejected: 'error',
      expired: 'default',
    }
    return variants[status]
  }

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear()
    const count = quotes.filter(q => q.number.includes(year.toString())).length + 1
    return \`ORC-\${year}-\${count.toString().padStart(3, '0')}\`
  }

  const calculateQuoteTotal = () => {
    const subtotal = quoteServices.reduce((acc, s) => acc + s.total, 0)
    let discount = 0
    if (quoteDiscount.type === 'percent') {
      discount = subtotal * (quoteDiscount.value / 100)
    } else {
      discount = quoteDiscount.value
    }
    return { subtotal, discount, total: subtotal - discount }
  }

  const addServiceToQuote = (template: ServiceTemplate) => {
    const newService: QuoteService = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      quantity: 1,
      unitPrice: template.defaultPrice,
      total: template.defaultPrice,
    }
    setQuoteServices(prev => [...prev, newService])
  }

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setQuoteServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, quantity, total: s.unitPrice * quantity }
        : s
    ))
  }

  const updateServicePrice = (serviceId: string, unitPrice: number) => {
    setQuoteServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, unitPrice, total: unitPrice * s.quantity }
        : s
    ))
  }

  const removeServiceFromQuote = (serviceId: string) => {
    setQuoteServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const resetQuoteForm = () => {
    setSelectedClient('')
    setQuoteServices([])
    setQuoteDiscount({ value: 0, type: 'percent' })
    setQuoteNotes('')
    setQuotePaymentTerms('')
    setQuoteValidDays(15)
    setEditingQuote(null)
  }

  const handleCreateQuote = () => {
    if (!selectedClient) {
      showToast('Selecione um cliente', 'error')
      return
    }
    if (quoteServices.length === 0) {
      showToast('Adicione pelo menos um serviço', 'error')
      return
    }

    const client = clients.find(c => c.id === selectedClient)
    if (!client) return

    const { subtotal, discount, total } = calculateQuoteTotal()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + quoteValidDays)

    const newQuote: Quote = {
      id: Date.now().toString(),
      number: generateQuoteNumber(),
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.name,
      },
      services: quoteServices,
      subtotal,
      discount: quoteDiscount.value,
      discountType: quoteDiscount.type,
      total,
      validUntil: validUntil.toISOString().split('T')[0],
      notes: quoteNotes || undefined,
      paymentTerms: quotePaymentTerms || undefined,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setQuotes(prev => [newQuote, ...prev])
    setShowQuoteModal(false)
    resetQuoteForm()
    showToast('Orçamento criado com sucesso!', 'success')
  }

  const handleSendQuote = (quote: Quote, method: 'email' | 'whatsapp') => {
    // Update quote status to sent
    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'sent' as QuoteStatus, sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : q
    ))

    if (method === 'email') {
      // Open email client
      const subject = encodeURIComponent(\`Orçamento \${quote.number} - \${quote.client.name}\`)
      const body = encodeURIComponent(\`Olá \${quote.client.name},\\n\\nSegue em anexo o orçamento solicitado.\\n\\nValor Total: R$ \${quote.total.toLocaleString('pt-BR')}\\nValidade: \${new Date(quote.validUntil).toLocaleDateString('pt-BR')}\\n\\nAtenciosamente.\`)
      window.open(\`mailto:\${quote.client.email}?subject=\${subject}&body=\${body}\`)
      showToast('Email preparado para envio!', 'success')
    } else {
      // Open WhatsApp
      const phone = quote.client.phone?.replace(/\\D/g, '')
      const message = encodeURIComponent(\`Olá \${quote.client.name}! Segue o orçamento \${quote.number} no valor de R$ \${quote.total.toLocaleString('pt-BR')}. Válido até \${new Date(quote.validUntil).toLocaleDateString('pt-BR')}.\`)
      window.open(\`https://wa.me/55\${phone}?text=\${message}\`)
      showToast('WhatsApp aberto!', 'success')
    }
  }

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId))
    showToast('Orçamento removido', 'info')
  }

  const handleAddAppointment = () => {`;

content = content.replace(beforeHandleAddAppointment, beforeHandleAddAppointmentNew);

fs.writeFileSync('src/app/(app)/admin/page.tsx', content);
console.log('Step 1 complete: Added imports, mock data, state, and helper functions');
