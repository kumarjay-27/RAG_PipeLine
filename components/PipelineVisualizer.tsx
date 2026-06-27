'use client'

import { PipelineVisualizerProps } from '@/types/rag'
import { motion } from 'framer-motion'

export default function PipelineVisualizer({ currentStep, completedSteps }: PipelineVisualizerProps) {
  const steps = [
    { key: 'supervisor', label: 'Supervisor (Router)' },
    { key: 'ingestion', label: 'Ingestion (Chunk & Embed)' },
    { key: 'retrieval', label: 'Retrieval (Vector Search)' },
    { key: 'generation', label: 'Generation (LLM Synthesis)' }
  ]

  const isCompleted = (key: string) => {
    if (currentStep === 'complete') return true
    if (key === 'supervisor' && (completedSteps.length > 0 || currentStep === 'retrieval' || currentStep === 'generation')) return true
    if (key === 'ingestion' && (completedSteps.includes('ingestion') || completedSteps.includes('retrieval') || completedSteps.includes('generation'))) return true
    if (key === 'retrieval' && (completedSteps.includes('retrieval') || completedSteps.includes('generation'))) return true
    if (key === 'generation' && completedSteps.includes('generation')) return true
    return false
  }

  const isActive = (key: string) => {
    if (currentStep === key) return true
    // When graph is ready to run or is idle, supervisor evaluates next steps
    if (currentStep === 'idle' && key === 'supervisor') return true
    return false
  }

  return (
    <div className="pipeline-container">
      {steps.map((step, index) => {
        const active = isActive(step.key)
        const completed = isCompleted(step.key)
        const nodeClass = `pipeline-node ${active ? 'active' : ''} ${completed ? 'completed' : ''}`
        const lineClass = `pipeline-line ${active ? 'active' : ''} ${completed ? 'completed' : ''}`

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: index === steps.length - 1 ? 'none' : 1 }}>
            <div className={nodeClass}>
              <motion.div 
                className="pipeline-circle"
                animate={active ? {
                  scale: [1, 1.1, 1],
                  borderColor: ['#22223b', '#6366f1', '#22223b']
                } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {completed ? '✓' : index + 1}
              </motion.div>
              <div className="pipeline-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={lineClass} />
            )}
          </div>
        )
      })}
    </div>
  )
}
