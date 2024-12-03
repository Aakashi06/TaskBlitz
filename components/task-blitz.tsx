'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Plus, Trash2, Download, Search, FileDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { TaskTimer } from './task-timer'

type Task = {
  id: string
  content: string
}

type Category = 'must' | 'should' | 'could' | 'wont'

type Tasks = {
  [key in Category]: Task[]
}

type NewTasks = {
  [key in Category]: string
}

const initialTasks: Tasks = {
  must: [],
  should: [],
  could: [],
  wont: [],
}

const initialNewTasks: NewTasks = {
  must: '',
  should: '',
  could: '',
  wont: '',
}

const categoryColors: { [key in Category]: string } = {
  must: 'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 border-rose-300 dark:border-rose-700/50',
  should: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-700/50',
  could: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-300 dark:border-emerald-700/50',
  wont: 'bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30 border-sky-300 dark:border-sky-700/50',
}

const categoryIcons: { [key in Category]: React.ReactNode } = {
  must: <span className="text-2xl">🌟</span>,
  should: <span className="text-2xl">💎</span>,
  could: <span className="text-2xl">⭐</span>,
  wont: <span className="text-2xl">🔮</span>,
}

export function TaskBlitz() {
  const [tasks, setTasks] = useState<Tasks>(initialTasks)
  const [newTasks, setNewTasks] = useState<NewTasks>(initialNewTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedTasks = localStorage.getItem('taskBlitzTasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('taskBlitzTasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (category: Category) => {
    if (newTasks[category].trim() === '') return
    const newTaskObj: Task = {
      id: Date.now().toString(),
      content: newTasks[category],
    }
    setTasks((prev) => ({
      ...prev,
      [category]: [...prev[category], newTaskObj],
    }))
    setNewTasks((prev) => ({
      ...prev,
      [category]: '',
    }))
  }

  const deleteTask = (category: Category, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [category]: prev[category].filter((task) => task.id !== taskId),
    }))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceCategory = source.droppableId as Category
    const destCategory = destination.droppableId as Category

    const newTasks = { ...tasks }
    const [reorderedItem] = newTasks[sourceCategory].splice(source.index, 1)
    newTasks[destCategory].splice(destination.index, 0, reorderedItem)

    setTasks(newTasks)
  }

  const exportAsPDF = async () => {
    if (!containerRef.current) return
    setIsExporting(true)
    const scale = 2
    const canvas = await html2canvas(containerRef.current, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: null,
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
    })

    pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST')
    pdf.save('taskblitz.pdf')
    setIsExporting(false)
  }

  const exportAsJPG = async () => {
    if (!containerRef.current) return
    setIsExporting(true)
    const scale = 2
    const canvas = await html2canvas(containerRef.current, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: null,
    })

    const link = document.createElement('a')
    link.download = 'taskblitz.jpg'
    link.href = canvas.toDataURL('image/jpeg', 1.0)
    link.click()
    setIsExporting(false)
  }

  const filteredTasks = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return Object.entries(tasks).reduce((acc, [category, categoryTasks]) => {
      acc[category as Category] = categoryTasks.filter(task =>
        task.content.toLowerCase().includes(lowercasedSearchTerm)
      )
      return acc
    }, {} as Tasks)
  }, [tasks, searchTerm])

  return (
    <LayoutGroup>
      <motion.div 
        className="w-full h-full flex flex-col space-y-4"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative flex-grow flex">
                  <Input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-r-none transition-all duration-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <Button
                    onClick={() => setSearchTerm(searchTerm)}
                    className="rounded-l-none bg-violet-500 hover:bg-violet-600 text-white transition-colors duration-300"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors duration-300">
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 mr-2" />
                      )}
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportAsPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportAsJPG}>
                      <Download className="w-4 h-4 mr-2" />
                      Export as JPG
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </motion.div>
        </Card>
        <DragDropContext onDragEnd={onDragEnd}>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {(['must', 'should', 'could', 'wont'] as Category[]).map((category) => (
              <motion.div
                key={category}
                layout
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  show: { opacity: 1, y: 0 }
                }}
                className="flex flex-col"
              >
                <Card className={`${categoryColors[category]} shadow-lg border-l-4 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 transform dark:bg-gray-800/50 dark:backdrop-blur-sm flex-grow`}>
                  <CardHeader className="pb-2 relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">
                      {categoryIcons[category]}
                    </div>
                    <CardTitle className="text-xl font-bold capitalize flex items-center">
                      {categoryIcons[category]}
                      <span className="ml-2">{category} Have</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 overflow-hidden flex flex-col h-full">
                    <div className="flex space-x-2 mb-4">
                      <Input
                        type="text"
                        placeholder={`Add ${category} have task...`}
                        value={newTasks[category]}
                        onChange={(e) => setNewTasks(prev => ({ ...prev, [category]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addTask(category)}
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 transition-all duration-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <Button 
                        onClick={() => addTask(category)} 
                        variant="secondary" 
                        className="shrink-0 bg-violet-500 hover:bg-violet-600 text-white transition-colors duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Droppable droppableId={category}>
                      {(provided) => (
                        <ul
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 flex-grow overflow-y-auto"
                        >
                          <AnimatePresence>
                            {filteredTasks[category].map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided) => (
                                  <motion.li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-gray-700/50 rounded-lg p-3 shadow-md flex justify-between items-center hover:shadow-lg transition-all duration-300"
                                  >
                                    <span className="text-gray-800 dark:text-gray-200">{task.content}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteTask(category, task.id)}
                                      className="opacity-50 hover:opacity-100 transition-opacity duration-300 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </motion.li>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </DragDropContext>
        <TaskTimer className="mt-4" />
      </motion.div>
    </LayoutGroup>
  )
}

