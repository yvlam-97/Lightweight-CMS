import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError, validateRequiredFields } from '@/lib/api/middleware'
import bcrypt from 'bcryptjs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function updateUser(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()

    // Validate required fields
    const validationError = validateRequiredFields(data, ['email', 'name'])
    if (validationError) return validationError

    // Validate email format
    if (!EMAIL_REGEX.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for duplicate email (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id: params.id },
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use by another user' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: {
      email: string
      name: string
      password?: string
    } = {
      email: data.email,
      name: data.name,
    }

    // Only update password if a new one is provided
    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    // Remove password hash from response
    const { password, ...sanitizedUser } = user

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/users/[id]')
  }
}

async function deleteUser(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Prevent self-deletion
    if (session?.user?.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if this is the last admin user
    const userCount = await prisma.user.count()
    if (userCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/users/[id]')
  }
}

export const PUT = withAuth(updateUser)
export const DELETE = withAuth(deleteUser)
