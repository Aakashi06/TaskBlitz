'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RefreshCw, Clock, PartyPopper } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

export function TaskTimer() {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [customDuration, setCustomDuration] = useState(25)
  const [taskName, setTaskName] = useState('')
  const [progress, setProgress] = useState(0)
  const [showAppreciation, setShowAppreciation] = useState(false)
  const [appreciationMessage, setAppreciationMessage] = useState('')

  const appreciationMessages = [
    "Congratulations! You've crushed it!",
    "Amazing work! You're on fire!",
    "Fantastic job! Keep up the great work!",
    "You're a superstar! Well done!",
    "Bravo! You've nailed it!"
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(interval!)
            setIsActive(false)
            setProgress(100)
            setAppreciationMessage(appreciationMessages[Math.floor(Math.random() * appreciationMessages.length)])
            setShowAppreciation(true)
            triggerConfetti()
            return 0
          }
          const newTime = prevTime - 1
          setProgress(((customDuration * 60 - newTime) / (customDuration * 60)) * 100)
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval!)
  }, [isActive, customDuration])

  useEffect(() => {
    setTimeLeft(customDuration * 60)
  }, [customDuration])

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    })
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(customDuration * 60)
    setProgress(0)
    setShowAppreciation(false)
  }

  const handleDurationChange = (value: number[]) => {
    setCustomDuration(value[0])
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <Card className="w-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center text-violet-800 dark:text-violet-200">
          <Clock className="w-6 h-6 mr-2" />
          Task Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          type="text"
          placeholder="Enter task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="w-full bg-white/50 dark:bg-gray-700/50 border-violet-300 dark:border-gray-600 focus:ring-violet-500 focus:border-violet-500 dark:focus:ring-violet-400 dark:focus:border-violet-400"
        />
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-violet-800 dark:text-violet-200">Duration: {customDuration} min</span>
          </div>
          <Slider
            value={[customDuration]}
            onValueChange={handleDurationChange}
            max={120}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-center items-center space-x-4">
          <Button onClick={toggleTimer} variant="outline" className="w-24 bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 focus:ring-violet-500 dark:focus:ring-violet-400">
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" className="w-24 bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 focus:ring-violet-500 dark:focus:ring-violet-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="text-4xl font-bold text-center text-violet-800 dark:text-violet-200">{formatTime(timeLeft)}</div>
        <div className="relative h-8 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600"
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <AnimatePresence>
          {showAppreciation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-violet-800 dark:text-violet-200 mb-2">
                {appreciationMessage}
              </p>
              <p className="text-md text-violet-700 dark:text-violet-300">
                You finished: {taskName}
              </p>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="mt-2"
              >
                <PartyPopper className="w-8 h-8 text-yellow-500 mx-auto" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter>
        {taskName && (
          <div className="text-center font-semibold w-full text-violet-800 dark:text-violet-200">
            Current Task: {taskName}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

