'use client';

import React from 'react';
import { ChartFormulaDisplay } from '@/shared/components';
import { calculateDatasetMetrics, type CalculationResult } from '@/shared/utils/calculationUtils';
import type { ChartDataset, ChartConfig } from '@/shared/types';

interface ChartFormulasProps {
  datasets: ChartDataset[];
  dateLabels: string[];
  config: ChartConfig;
  className?: string;
}

/**
 * Component that displays formulas below charts based on the current chart configuration
 */
export const ChartFormulas: React.FC<ChartFormulasProps> = ({
  datasets,
  dateLabels,
  config,
  className = ''
}) => {
  if (!config.showFormulas) {
    return null;
  }

  const formulaResults: CalculationResult[] = [];

  datasets.forEach(dataset => {
    const metrics = calculateDatasetMetrics(dataset, dateLabels);
    
    formulaResults.push({
      ...metrics.averageSales,
      formula: `${dataset.label}: ${metrics.averageSales.formula}`
    });

    if (config.comparisonMode === 'week-over-week') {
      const lastValidIndex = dataset.data.findLastIndex(value => value !== null);
      if (lastValidIndex > 0 && metrics.weekOverWeek.calculations[lastValidIndex]) {
        const wowCalculation = metrics.weekOverWeek.calculations[lastValidIndex];
        formulaResults.push({
          ...wowCalculation,
          formula: `${dataset.label} WoW: ${wowCalculation.formula}`
        });
      }
    } else if (config.comparisonMode === 'cumulative') {
      if (metrics.cumulative.totalSum !== null) {
        formulaResults.push({
          value: metrics.cumulative.totalSum,
          formula: `${dataset.label} Cumulative Total: ${metrics.cumulative.totalSum}`,
          latexFormula: `\\text{Cumulative Total} = ${metrics.cumulative.totalSum}`,
          isValid: true
        });
      }
    }
  });

  if (formulaResults.length === 0) {
    return (
      <div className={`chart-formulas-empty ${className}`}>
        <p className="text-sm text-gray-500 text-center py-2">
          No formulas available for current data
        </p>
      </div>
    );
  }

  return (
    <div className={`chart-formulas-container ${className}`}>
      <ChartFormulaDisplay
        results={formulaResults}
        chartTitle={getChartTitle(config)}
        className="mt-4"
      />
    </div>
  );
};

/**
 * Helper function to generate chart title based on configuration
 */
function getChartTitle(config: ChartConfig): string {
  const modeTitle = config.comparisonMode === 'week-over-week' 
    ? 'Week-over-Week' 
    : 'Cumulative';
  
  const chartType = config.type === 'line' ? 'Line' : 'Bar';
  
  return `${chartType} Chart (${modeTitle})`;
}

interface DatasetFormulaProps {
  dataset: ChartDataset;
  dateLabels: string[];
  showDetailed?: boolean;
  className?: string;
}

/**
 * Component for displaying detailed formulas for a single dataset
 */
export const DatasetFormula: React.FC<DatasetFormulaProps> = ({
  dataset,
  dateLabels,
  showDetailed = false,
  className = ''
}) => {
  const metrics = calculateDatasetMetrics(dataset, dateLabels);
  
  const formulas: CalculationResult[] = [metrics.averageSales];
  
  if (showDetailed) {
    metrics.weekOverWeek.calculations
      .filter(calc => calc.isValid)
      .forEach((calc, index) => {
        formulas.push({
          ...calc,
          formula: `Week ${index + 2}: ${calc.formula}` // +2 because WoW starts from week 2
        });
      });
  }

  return (
    <div className={`dataset-formula ${className}`}>
      <h4 className="text-sm font-medium  mb-2">
        {dataset.label}
      </h4>
      
      <div className="formula-details space-y-2">
        {formulas.map((formula, index) => (
          <ChartFormulaDisplay
            key={index}
            results={[formula]}
            className="text-sm"
          />
        ))}
      </div>
      
      {showDetailed && (
        <div className="dataset-stats mt-3 text-xs ">
          <div>Total Sales: {metrics.totalSales?.toLocaleString() || 'N/A'}</div>
          <div>Valid Weeks: {metrics.validWeeks}</div>
        </div>
      )}
    </div>
  );
};

export default ChartFormulas;