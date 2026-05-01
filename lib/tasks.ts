import { google } from 'googleapis'

export interface Task {
  id: string
  title: string
  done: boolean
}

const LIST_TITLE = 'Atlas Reminders'

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

async function getListId(tasks: any, auth: any): Promise<string> {
  const res = await tasks.tasklists.list({ auth, maxResults: 50 })
  const existing = (res.data.items ?? []).find((l: any) => l.title === LIST_TITLE)
  if (existing) return existing.id
  const created = await tasks.tasklists.insert({ auth, requestBody: { title: LIST_TITLE } })
  return created.data.id
}

export async function getTasks(accessToken: string): Promise<Task[]> {
  const auth = makeAuth(accessToken)
  const tasks = google.tasks({ version: 'v1', auth })
  const listId = await getListId(tasks, auth)
  const res = await tasks.tasks.list({
    auth,
    tasklist: listId,
    showCompleted: true,
    showHidden: false,
    maxResults: 100,
  })
  return (res.data.items ?? []).map((t: any) => ({
    id: t.id,
    title: t.title ?? '',
    done: t.status === 'completed',
  }))
}

export async function createTask(accessToken: string, title: string): Promise<Task> {
  const auth = makeAuth(accessToken)
  const tasks = google.tasks({ version: 'v1', auth })
  const listId = await getListId(tasks, auth)
  const res = await tasks.tasks.insert({
    auth,
    tasklist: listId,
    requestBody: { title, status: 'needsAction' },
  })
  return { id: res.data.id!, title: res.data.title!, done: false }
}

export async function patchTask(
  accessToken: string,
  taskId: string,
  done: boolean
): Promise<void> {
  const auth = makeAuth(accessToken)
  const tasks = google.tasks({ version: 'v1', auth })
  const listId = await getListId(tasks, auth)
  await tasks.tasks.patch({
    auth,
    tasklist: listId,
    task: taskId,
    requestBody: { status: done ? 'completed' : 'needsAction' },
  })
}

export async function removeTask(accessToken: string, taskId: string): Promise<void> {
  const auth = makeAuth(accessToken)
  const tasks = google.tasks({ version: 'v1', auth })
  const listId = await getListId(tasks, auth)
  await tasks.tasks.delete({ auth, tasklist: listId, task: taskId })
}
