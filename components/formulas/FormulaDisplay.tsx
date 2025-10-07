import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { generateCalculationLatexFormula } from '@/shared/utils/calculationUtils'

interface FormulaDisplayProps {
  type: 'average' | 'wow' | 'cumulative'
  inline?: boolean
  className?: string
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ 
  type, 
  inline = false, 
  className = '' 
}) => {
  const formula = generateCalculationLatexFormula(type === 'wow' ? 'week-over-week' : type, {})
  
  if (!formula) return null

  const MathComponent = inline ? InlineMath : BlockMath

  return (
    <div className={`formula-display ${className}`}>
      <MathComponent math={formula} />
    </div>
  )
}