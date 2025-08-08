import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření JWT tokenu
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, (() => { const v = process.env.JWT_SECRET; if (!v) throw new Error('JWT_SECRET is required'); return v })()) as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET /api/advertiser/billing/invoice/[id] - stažení faktury
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const invoiceId = params.id

    // V reálné implementaci by zde bylo načtení faktury z databáze
    // a generování PDF pomocí knihovny jako je puppeteer nebo jsPDF
    
    // Pro demo účely vygenerujeme jednoduchou fake PDF odpověď
    const pdfContent = generateMockInvoicePDF(invoiceId, user.companyId)
    
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error downloading invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download invoice' },
      { status: 500 }
    )
  }
}

// Mock funkce pro generování PDF obsahu
function generateMockInvoicePDF(invoiceId: string, companyId: string): Buffer {
  // V reálné implementaci by zde bylo skutečné generování PDF
  // Například pomocí knihovny puppeteer, jsPDF nebo podobné
  
  const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 700 Td
(Invoice #${invoiceId}) Tj
0 -20 Td
(Company ID: ${companyId}) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(This is a mock invoice for demonstration purposes.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000250 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
570
%%EOF`

  return Buffer.from(mockPdfContent)
} 