import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTasks, createTask, patchTask, removeTask } from '@/lib/tasks'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const tasks = await getTasks(session.accessToken)
    return NextResponse.json({ tasks })
  } catch (err) {
    console.error('Tasks GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { title } = await req.json()
  const task = await createTask(session.accessToken, title)
  return NextResponse.json({ task })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id, done } = await req.json()
  await patchTask(session.accessToken, id, done)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id } = await req.json()
  await removeTask(session.accessToken, id)
  return NextResponse.json({ ok: true })
}
