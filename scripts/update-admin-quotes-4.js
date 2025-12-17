const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/admin/page.tsx', 'utf8');

// 1. Add import for generateQuotePDF
const oldImport = `import { Quote, QuoteService, QuoteStatus, ServiceTemplate } from '@/types'`;
const newImport = `import { Quote, QuoteService, QuoteStatus, ServiceTemplate } from '@/types'
import { generateQuotePDF } from '@/lib/pdf/generate-quote'`;

content = content.replace(oldImport, newImport);

// 2. Update the PDF button to call generateQuotePDF
const oldPDFButton = `<button
                          onClick={() => showToast('PDF gerado! (funcionalidade em desenvolvimento)', 'info')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Download size={14} />
                          PDF
                        </button>`;

const newPDFButton = `<button
                          onClick={() => { generateQuotePDF(quote); showToast('PDF gerado com sucesso!', 'success'); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Download size={14} />
                          PDF
                        </button>`;

content = content.replace(oldPDFButton, newPDFButton);

fs.writeFileSync('src/app/(app)/admin/page.tsx', content);
console.log('Step 4 complete: Added PDF generation import and functionality');
