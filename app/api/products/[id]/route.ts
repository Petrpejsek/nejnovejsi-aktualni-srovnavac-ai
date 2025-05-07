import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Loading product details with ID:', params.id)
    
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      }
    })

    if (!product) {
      return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    console.log('Loaded product:', product)
    
    // Formátování dat pro front-end
    const formattedProduct = {
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      advantages: JSON.parse(product.advantages || '[]'),
      disadvantages: JSON.parse(product.disadvantages || '[]'),
      videoUrls: JSON.parse(product.videoUrls || '[]'),
    }
    
    // Bezpečné zpracování pricingInfo
    try {
      if (product.pricingInfo) {
        const parsed = JSON.parse(product.pricingInfo);
        // @ts-ignore - frontend očekává objekt, i když typování očekává string
        formattedProduct.pricingInfo = {
          basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
          pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
          enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
        };
      } else {
        // @ts-ignore
        formattedProduct.pricingInfo = { basic: '0', pro: '0', enterprise: '0' };
      }
    } catch (error) {
      console.error('Error parsing pricingInfo:', error);
      // @ts-ignore
      formattedProduct.pricingInfo = { basic: '0', pro: '0', enterprise: '0' };
    }
    
    return new NextResponse(JSON.stringify(formattedProduct), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error loading product:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    console.log('Received data for update:', data) // For debugging

    // Explicitly process externalUrl
    const externalUrl = data.externalUrl === '' ? null : data.externalUrl
    
    // Bezpečné zpracování pricingInfo před uložením do DB
    let pricingInfoStr;
    try {
      if (typeof data.pricingInfo === 'object' && data.pricingInfo !== null) {
        // Zajistíme správnou strukturu
        const pricingObj = {
          basic: typeof data.pricingInfo.basic === 'string' ? data.pricingInfo.basic : '0',
          pro: typeof data.pricingInfo.pro === 'string' ? data.pricingInfo.pro : '0',
          enterprise: typeof data.pricingInfo.enterprise === 'string' ? data.pricingInfo.enterprise : '0'
        };
        pricingInfoStr = JSON.stringify(pricingObj);
      } else if (typeof data.pricingInfo === 'string') {
        // Zkusíme parsovat string, abychom zajistili, že má správný formát
        try {
          const parsed = JSON.parse(data.pricingInfo);
          const validated = {
            basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
            pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
            enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
          };
          pricingInfoStr = JSON.stringify(validated);
        } catch (e) {
          // Neplatný JSON, použijeme výchozí hodnoty
          pricingInfoStr = JSON.stringify({ basic: '0', pro: '0', enterprise: '0' });
        }
      } else {
        // Undefined nebo neplatný typ, zachováme původní hodnotu (undefined)
        pricingInfoStr = undefined;
      }
    } catch (error) {
      console.error('Error processing pricingInfo:', error);
      pricingInfoStr = JSON.stringify({ basic: '0', pro: '0', enterprise: '0' });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price?.toString() || "0") : undefined,
        category: data.category,
        imageUrl: data.imageUrl,
        tags: data.tags !== undefined ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || [])) : undefined,
        advantages: data.advantages !== undefined ? (typeof data.advantages === 'string' ? data.advantages : JSON.stringify(data.advantages || [])) : undefined,
        disadvantages: data.disadvantages !== undefined ? (typeof data.disadvantages === 'string' ? data.disadvantages : JSON.stringify(data.disadvantages || [])) : undefined,
        detailInfo: data.detailInfo,
        pricingInfo: pricingInfoStr,
        videoUrls: data.videoUrls !== undefined ? (typeof data.videoUrls === 'string' ? data.videoUrls : JSON.stringify(data.videoUrls || [])) : undefined,
        externalUrl: externalUrl,
        hasTrial: data.hasTrial !== undefined ? Boolean(data.hasTrial) : undefined
      },
    })

    console.log('Updated product:', product) // For debugging
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    )
  }
} 