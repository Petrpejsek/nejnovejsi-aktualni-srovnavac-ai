import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// DELETE /api/landing-pages/[id] - Delete a landing page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - only admin can delete landing pages
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin' || session?.user?.email === 'admin@admin.com'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - only admin can delete landing pages' },
        { status: 403 }
      )
    }

    // Check if landing page exists
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, slug: true, language: true }
    })

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // Delete the landing page
    await prisma.landingPage.delete({
      where: { id: params.id }
    })

    console.log(`🗑️ Landing page deleted: ${landingPage.title} (${landingPage.slug}, ${landingPage.language}) by ${session?.user?.email}`)

    return NextResponse.json({
      success: true,
      message: 'Landing page deleted successfully',
      deletedPage: {
        id: landingPage.id,
        title: landingPage.title,
        slug: landingPage.slug,
        language: landingPage.language
      }
    })

  } catch (error) {
    console.error('Error deleting landing page:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete landing page' },
      { status: 500 }
    )
  }
}

// GET /api/landing-pages/[id] - Get a specific landing page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: params.id }
    })

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(landingPage)

  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing page' },
      { status: 500 }
    )
  }
}

// PUT /api/landing-pages/[id] - Update a landing page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - only admin can update landing pages
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin' || session?.user?.email === 'admin@admin.com'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - only admin can update landing pages' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.contentHtml) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if landing page exists
    const existingPage = await prisma.landingPage.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // If slug or language changed, check for conflicts
    if ((data.slug && data.slug !== existingPage.slug) || 
        (data.language && data.language !== existingPage.language)) {
      
      const slugCheck = await prisma.landingPage.findFirst({
        where: {
          slug: data.slug || existingPage.slug,
          language: data.language || existingPage.language,
          id: { not: params.id } // Exclude current page
        }
      })

      if (slugCheck) {
        return NextResponse.json(
          { 
            error: `A landing page with slug '${data.slug || existingPage.slug}' and language '${data.language || existingPage.language}' already exists`,
            conflictingPage: {
              id: slugCheck.id,
              title: slugCheck.title,
              language: slugCheck.language,
              createdAt: slugCheck.createdAt
            }
          },
          { status: 409 }
        )
      }
    }

    // Update the landing page
    const updatedPage = await prisma.landingPage.update({
      where: { id: params.id },
      data: {
        title: data.title,
        summary: data.summary,
        contentHtml: data.contentHtml,
        slug: data.slug || existingPage.slug,
        language: data.language || existingPage.language,
        metaDescription: data.metaDescription || data.summary || `${data.title} - Comparee.ai`,
        metaKeywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords || '',
        faq: data.faq,
        visuals: data.visuals,
        updatedAt: new Date()
      }
    })

    console.log(`✏️ Landing page updated: ${updatedPage.title} (${updatedPage.slug}, ${updatedPage.language}) by ${session?.user?.email}`)

    return NextResponse.json({
      success: true,
      message: 'Landing page updated successfully',
      landingPage: updatedPage,
      url: `/${updatedPage.language}/landing/${updatedPage.slug}`
    })

  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json(
      { error: 'Failed to update landing page' },
      { status: 500 }
    )
  }
}