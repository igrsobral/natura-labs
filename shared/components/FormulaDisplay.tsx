'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import type { CalculationResult } from '@/shared/utils/calculationUtils';

interface FormulaDisplayProps {
  result: CalculationResult;
  label?: string;
  displayMode?: 'inline' | 'block';
  showFormula?: boolean;
  showValue?: boolean;
  className?: string;
}

/**
 * Component for displaying mathematical formulas with LaTeX rendering
 * Supports both inline and block display modes
 */
export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  result,
  label,
  displayMode = 'inline',
  showFormula = true,
  showValue = true,
  className = ''
}) => {
  const MathComponent = displayMode === 'block' ? BlockMath : InlineMath;

  if (!result.isValid || result.value === null) {
    return (
      <div className={`formula-display formula-error ${className}`}>
        {label && <span className="formula-label text-sm font-medium ">{label}:</span>}
        <span className="error-message text-sm text-red-600 ml-2">
          {result.errorMessage || 'Unable to calculate'}
        </span>
      </div>
    );
  }

  return (
    <div className={`formula-display ${className}`}>
      {label && (
        <div className="formula-label text-sm font-medium  mb-1">
          {label}
        </div>
      )}
      
      <div className="formula-content flex flex-col gap-1">
        {showValue && (
          <div className="formula-value text-lg font-semibold ">
            {typeof result.value === 'number' ? result.value.toLocaleString() : 'N/A'}
          </div>
        )}
        
        {showFormula && (
          <div className="formula-math">
            <MathComponent math={result.latexFormula} />
          </div>
        )}
        
        {showFormula && (
          <div className="formula-explanation text-xs text-gray-500">
            {result.formula}
          </div>
        )}
      </div>
    </div>
  );
};

interface MultipleFormulasDisplayProps {
  results: CalculationResult[];
  title?: string;
  displayMode?: 'inline' | 'block';
  showFormulas?: boolean;
  className?: string;
}

/**
 * Component for displaying multiple formulas in a grid layout
 */
export const MultipleFormulasDisplay: React.FC<MultipleFormulasDisplayProps> = ({
  results,
  title,
  displayMode = 'inline',
  showFormulas = true,
  className = ''
}) => {
  if (results.length === 0) {
    return (
      <div className={`formulas-display ${className}`}>
        {title && <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>}
        <p className="text-sm text-gray-500">No formulas to display</p>
      </div>
    );
  }

  return (
    <div className={`formulas-display ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      
      <div className="formulas-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <div key={index} className="formula-item p-3  rounded-lg border">
            <FormulaDisplay
              result={result}
              displayMode={displayMode}
              showFormula={showFormulas}
              showValue={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChartFormulaDisplayProps {
  results: CalculationResult[];
  chartTitle?: string;
  className?: string;
}

/**
 * Specialized component for displaying formulas below charts
 */
export const ChartFormulaDisplay: React.FC<ChartFormulaDisplayProps> = ({
  results,
  chartTitle,
  className = ''
}) => {
  const validResults = results.filter(result => result.isValid);
  const invalidResults = results.filter(result => !result.isValid);

  return (
    <div className={`chart-formulas ${className}`}>
      {chartTitle && (
        <h4 className="text-base font-medium  mb-2">
          Calculations for {chartTitle}
        </h4>
      )}
      
      {validResults.length > 0 && (
        <div className="valid-formulas space-y-2 mb-3">
          {validResults.map((result, index) => (
            <div key={index} className="formula-row flex items-center gap-4 p-2  rounded">
              <div className="formula-value text-sm font-semibold text-primary">
                {result.value?.toLocaleString()}
              </div>
              <div className="formula-latex flex-1">
                <InlineMath math={result.latexFormula} />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {invalidResults.length > 0 && (
        <div className="invalid-formulas space-y-1">
          {invalidResults.map((result, index) => (
            <div key={index} className="error-row text-xs text-red-600 p-1 bg-red-50 rounded">
              {result.errorMessage || 'Calculation error'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormulaDisplay;