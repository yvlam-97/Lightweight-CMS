import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError, validateRequiredFields } from '@/lib/api/middleware'
import bcrypt from 'bcryptjs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          select: { provider: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Remove password hashes from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/users')
  }
}

async function createUser(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const validationError = validateRequiredFields(data, ['email', 'name', 'password'])
    if (validationError) return validationError

    // Validate email format
    if (!EMAIL_REGEX.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'admin',
      },
    })

    // Remove password hash from response
    const { password, ...sanitizedUser } = user

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/users')
  }
}

export const GET = withAuth(getUsers)
export const POST = withAuth(createUser)
