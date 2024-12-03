import { TaskBlitz } from '@/components/task-blitz'

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <TaskBlitz />
    </main>
  )
}

