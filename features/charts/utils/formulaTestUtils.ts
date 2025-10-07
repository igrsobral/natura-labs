/**
 * Test utilities for formula calculations and LaTeX rendering
 * Used for development and testing purposes
 */

import { 
  calculateAverageSales, 
  calculateWeekOverWeek, 
  calculateCumulative,
  calculateDatasetMetrics,
  type CalculationResult 
} from '@/shared/utils/calculationUtils';
import type { ChartDataset } from '@/shared/types';

/**
 * Sample data for testing formula calculations
 */
export const sampleSalesData = [100, 150, null, 200, 175, 225, null, 300];
export const sampleDateLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];

export const sampleDataset: ChartDataset = {
  label: 'Brand A - Electronics',
  data: sampleSalesData,
  brandName: 'Brand A',
  categoryName: 'Electronics'
};

/**
 * Test all calculation functions with sample data
 */
export function testCalculations(): {
  averageSales: CalculationResult;
  weekOverWeek: ReturnType<typeof calculateWeekOverWeek>;
  cumulative: ReturnType<typeof calculateCumulative>;
  datasetMetrics: ReturnType<typeof calculateDatasetMetrics>;
} {
  console.log('Testing formula calculations...');
  
  // Test average sales calculation
  const averageSales = calculateAverageSales(sampleSalesData);
  console.log('Average Sales:', averageSales);
  
  // Test week-over-week calculation
  const weekOverWeek = calculateWeekOverWeek(sampleSalesData, true);
  console.log('Week-over-Week:', weekOverWeek);
  
  // Test cumulative calculation
  const cumulative = calculateCumulative(sampleSalesData);
  console.log('Cumulative:', cumulative);
  
  // Test dataset metrics
  const datasetMetrics = calculateDatasetMetrics(sampleDataset);
  console.log('Dataset Metrics:', datasetMetrics);
  
  return {
    averageSales,
    weekOverWeek,
    cumulative,
    datasetMetrics
  };
}

/**
 * Generate sample formula results for testing LaTeX rendering
 */
export function generateSampleFormulas(): CalculationResult[] {
  const results = testCalculations();
  
  return [
    results.averageSales,
    ...results.weekOverWeek.calculations.filter(calc => calc.isValid).slice(0, 3), // First 3 valid WoW calculations
    {
      value: results.cumulative.totalSum,
      formula: `Cumulative Total: ${results.cumulative.totalSum}`,
      latexFormula: `\\sum_{i=1}^{n} \\text{Sales}_i = ${results.cumulative.totalSum}`,
      isValid: results.cumulative.totalSum !== null
    }
  ];
}

/**
 * Test edge cases for formula calculations
 */
export function testEdgeCases(): {
  allNull: CalculationResult;
  singleValue: CalculationResult;
  zeroValues: CalculationResult;
  emptyArray: CalculationResult;
} {
  console.log('Testing edge cases...');
  
  // All null values
  const allNull = calculateAverageSales([null, null, null]);
  console.log('All Null:', allNull);
  
  // Single value
  const singleValue = calculateAverageSales([100]);
  console.log('Single Value:', singleValue);
  
  // Zero values
  const zeroValues = calculateAverageSales([0, 0, 0]);
  console.log('Zero Values:', zeroValues);
  
  // Empty array
  const emptyArray = calculateAverageSales([]);
  console.log('Empty Array:', emptyArray);
  
  return {
    allNull,
    singleValue,
    zeroValues,
    emptyArray
  };
}

/**
 * Validate LaTeX formula syntax
 */
export function validateLatexFormulas(results: CalculationResult[]): {
  valid: CalculationResult[];
  invalid: CalculationResult[];
} {
  const valid: CalculationResult[] = [];
  const invalid: CalculationResult[] = [];
  
  results.forEach(result => {
    if (result.latexFormula && result.latexFormula.trim() !== '') {
      // Basic LaTeX validation - check for balanced braces
      const openBraces = (result.latexFormula.match(/\{/g) || []).length;
      const closeBraces = (result.latexFormula.match(/\}/g) || []).length;
      
      if (openBraces === closeBraces) {
        valid.push(result);
      } else {
        invalid.push(result);
      }
    } else {
      invalid.push(result);
    }
  });
  
  return { valid, invalid };
}

/**
 * Performance test for calculations
 */
export function performanceTest(iterations: number = 1000): {
  averageTime: number;
  totalTime: number;
  iterationsPerSecond: number;
} {
  console.log(`Running performance test with ${iterations} iterations...`);
  
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    calculateAverageSales(sampleSalesData);
    calculateWeekOverWeek(sampleSalesData);
    calculateCumulative(sampleSalesData);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  const iterationsPerSecond = 1000 / averageTime;
  
  console.log(`Performance test results:
    Total time: ${totalTime.toFixed(2)}ms
    Average time per iteration: ${averageTime.toFixed(4)}ms
    Iterations per second: ${iterationsPerSecond.toFixed(0)}
  `);
  
  return {
    averageTime,
    totalTime,
    iterationsPerSecond
  };
}