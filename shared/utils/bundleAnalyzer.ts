// Bundle analysis and optimization utilities

export interface BundleInfo {
  totalSize: number;
  gzippedSize: number;
  modules: ModuleInfo[];
  chunks: ChunkInfo[];
  assets: AssetInfo[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

export interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
  isInitial: boolean;
  isAsync: boolean;
}

export interface AssetInfo {
  name: string;
  size: number;
  type: string;
  cached: boolean;
}

// Bundle size thresholds (in KB)
export const BUNDLE_SIZE_THRESHOLDS = {
  INITIAL_JS: 250,      // Initial JavaScript bundle
  INITIAL_CSS: 50,      // Initial CSS bundle
  ASYNC_CHUNK: 100,     // Async chunks
  IMAGE: 100,           // Individual images
  FONT: 50,             // Individual fonts
  TOTAL_INITIAL: 500,   // Total initial bundle size
} as const;

// Performance budget checker
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();

  constructor(budgets?: Record<string, number>) {
    if (budgets) {
      Object.entries(budgets).forEach(([key, value]) => {
        this.budgets.set(key, value);
      });
    } else {
      // Set default budgets
      this.budgets.set('initial-js', BUNDLE_SIZE_THRESHOLDS.INITIAL_JS);
      this.budgets.set('initial-css', BUNDLE_SIZE_THRESHOLDS.INITIAL_CSS);
      this.budgets.set('async-chunk', BUNDLE_SIZE_THRESHOLDS.ASYNC_CHUNK);
      this.budgets.set('total-initial', BUNDLE_SIZE_THRESHOLDS.TOTAL_INITIAL);
    }
  }

  setBudget(category: string, sizeKB: number): void {
    this.budgets.set(category, sizeKB);
  }

  checkBudget(category: string, actualSizeKB: number): {
    withinBudget: boolean;
    budget: number;
    actual: number;
    percentage: number;
  } {
    const budget = this.budgets.get(category) || 0;
    const withinBudget = actualSizeKB <= budget;
    const percentage = budget > 0 ? (actualSizeKB / budget) * 100 : 0;

    return {
      withinBudget,
      budget,
      actual: actualSizeKB,
      percentage
    };
  }

  getAllBudgets(): Record<string, number> {
    return Object.fromEntries(this.budgets);
  }
}

// Bundle analyzer class
export class BundleAnalyzer {
  private performanceBudget: PerformanceBudget;

  constructor(budgets?: Record<string, number>) {
    this.performanceBudget = new PerformanceBudget(budgets);
  }

  // Analyze current page resources
  analyzeCurrentPage(): BundleInfo {
    if (typeof window === 'undefined') {
      return this.getEmptyBundleInfo();
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const modules: ModuleInfo[] = [];
    const assets: AssetInfo[] = [];
    let totalSize = 0;

    resources.forEach((resource) => {
      const size = this.estimateResourceSize(resource);
      const type = this.getResourceType(resource.name);
      
      totalSize += size;

      const moduleInfo: ModuleInfo = {
        name: resource.name,
        size,
        gzippedSize: size * 0.7, // Rough estimation
        type
      };

      modules.push(moduleInfo);

      const assetInfo: AssetInfo = {
        name: resource.name,
        size,
        type,
        cached: resource.transferSize === 0
      };

      assets.push(assetInfo);
    });

    return {
      totalSize,
      gzippedSize: totalSize * 0.7, // Rough estimation
      modules,
      chunks: this.analyzeChunks(modules),
      assets
    };
  }

  private estimateResourceSize(resource: PerformanceResourceTiming): number {
    // Use transferSize if available, otherwise estimate
    if (resource.transferSize > 0) {
      return resource.transferSize;
    }

    // Rough estimation based on load time and type
    const loadTime = resource.responseEnd - resource.requestStart;
    const type = this.getResourceType(resource.name);

    switch (type) {
      case 'js':
        return Math.max(loadTime * 10, 1000); // Minimum 1KB
      case 'css':
        return Math.max(loadTime * 5, 500);   // Minimum 0.5KB
      case 'image':
        return Math.max(loadTime * 20, 2000); // Minimum 2KB
      case 'font':
        return Math.max(loadTime * 15, 1500); // Minimum 1.5KB
      default:
        return Math.max(loadTime * 8, 800);   // Minimum 0.8KB
    }
  }

  private getResourceType(url: string): ModuleInfo['type'] {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'mjs', 'jsx', 'ts', 'tsx'].includes(extension)) {
      return 'js';
    }
    
    if (['css', 'scss', 'sass', 'less'].includes(extension)) {
      return 'css';
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension)) {
      return 'image';
    }
    
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
      return 'font';
    }
    
    return 'other';
  }

  private analyzeChunks(modules: ModuleInfo[]): ChunkInfo[] {
    // Group modules into chunks based on naming patterns
    const chunkMap = new Map<string, ModuleInfo[]>();

    modules.forEach((module) => {
      const chunkName = this.getChunkName(module.name);
      if (!chunkMap.has(chunkName)) {
        chunkMap.set(chunkName, []);
      }
      chunkMap.get(chunkName)!.push(module);
    });

    return Array.from(chunkMap.entries()).map(([name, chunkModules]) => ({
      name,
      size: chunkModules.reduce((sum, mod) => sum + mod.size, 0),
      modules: chunkModules.map(mod => mod.name),
      isInitial: name.includes('main') || name.includes('index'),
      isAsync: name.includes('chunk') || name.includes('lazy')
    }));
  }

  private getChunkName(url: string): string {
    const filename = url.split('/').pop() || url;
    
    // Extract chunk name from Next.js naming patterns
    if (filename.includes('_app')) return 'app';
    if (filename.includes('_document')) return 'document';
    if (filename.includes('main')) return 'main';
    if (filename.includes('webpack')) return 'webpack';
    if (filename.includes('framework')) return 'framework';
    if (filename.includes('commons')) return 'commons';
    if (filename.includes('chunk')) return 'async-chunk';
    
    // Extract from hash-based names
    const hashMatch = filename.match(/^([a-zA-Z0-9]+)-[a-f0-9]+\./);
    if (hashMatch) {
      return hashMatch[1];
    }
    
    return filename.split('.')[0] || 'unknown';
  }

  private getEmptyBundleInfo(): BundleInfo {
    return {
      totalSize: 0,
      gzippedSize: 0,
      modules: [],
      chunks: [],
      assets: []
    };
  }

  // Generate bundle report
  generateReport(): {
    summary: {
      totalSize: string;
      gzippedSize: string;
      moduleCount: number;
      chunkCount: number;
    };
    budgetStatus: Record<string, any>;
    recommendations: string[];
    largestModules: ModuleInfo[];
    largestChunks: ChunkInfo[];
  } {
    const bundleInfo = this.analyzeCurrentPage();
    
    // Budget analysis
    const budgetStatus: Record<string, any> = {};
    const jsModules = bundleInfo.modules.filter(m => m.type === 'js');
    const cssModules = bundleInfo.modules.filter(m => m.type === 'css');
    const initialChunks = bundleInfo.chunks.filter(c => c.isInitial);
    
    const totalJsSize = jsModules.reduce((sum, m) => sum + m.size, 0) / 1024; // KB
    const totalCssSize = cssModules.reduce((sum, m) => sum + m.size, 0) / 1024; // KB
    const totalInitialSize = initialChunks.reduce((sum, c) => sum + c.size, 0) / 1024; // KB

    budgetStatus.js = this.performanceBudget.checkBudget('initial-js', totalJsSize);
    budgetStatus.css = this.performanceBudget.checkBudget('initial-css', totalCssSize);
    budgetStatus.total = this.performanceBudget.checkBudget('total-initial', totalInitialSize);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!budgetStatus.js.withinBudget) {
      recommendations.push(`JavaScript bundle is ${Math.round(budgetStatus.js.percentage - 100)}% over budget. Consider code splitting.`);
    }
    
    if (!budgetStatus.css.withinBudget) {
      recommendations.push(`CSS bundle is ${Math.round(budgetStatus.css.percentage - 100)}% over budget. Consider removing unused styles.`);
    }
    
    if (bundleInfo.modules.some(m => m.type === 'image' && m.size > BUNDLE_SIZE_THRESHOLDS.IMAGE * 1024)) {
      recommendations.push('Some images are larger than recommended. Consider optimizing or lazy loading.');
    }
    
    if (bundleInfo.chunks.filter(c => c.isAsync).length === 0) {
      recommendations.push('No async chunks detected. Consider implementing code splitting for better performance.');
    }

    return {
      summary: {
        totalSize: this.formatBytes(bundleInfo.totalSize),
        gzippedSize: this.formatBytes(bundleInfo.gzippedSize),
        moduleCount: bundleInfo.modules.length,
        chunkCount: bundleInfo.chunks.length
      },
      budgetStatus,
      recommendations,
      largestModules: bundleInfo.modules
        .sort((a, b) => b.size - a.size)
        .slice(0, 10),
      largestChunks: bundleInfo.chunks
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Tree shaking utilities
export const treeShaking = {
  // Check if a module is tree-shakeable
  isTreeShakeable: (moduleName: string): boolean => {
    // Common patterns for tree-shakeable modules
    const treeShakeablePatterns = [
      /^lodash\//, // Lodash individual functions
      /^@material-ui\/icons\//, // Material-UI icons
      /^react-icons\//, // React icons
      /^date-fns\//, // Date-fns individual functions
    ];

    return treeShakeablePatterns.some(pattern => pattern.test(moduleName));
  },

  // Suggest tree-shaking optimizations
  suggestOptimizations: (modules: ModuleInfo[]): string[] => {
    const suggestions: string[] = [];
    
    modules.forEach(module => {
      if (module.name.includes('lodash') && !module.name.includes('lodash/')) {
        suggestions.push('Use individual Lodash imports instead of the entire library');
      }
      
      if (module.name.includes('moment') && module.size > 50000) {
        suggestions.push('Consider replacing Moment.js with date-fns or Day.js for smaller bundle size');
      }
      
      if (module.name.includes('material-ui') && !module.name.includes('/')) {
        suggestions.push('Use individual Material-UI component imports');
      }
    });

    return suggestions;
  }
};

// Export utilities
export const bundleAnalyzer = new BundleAnalyzer();
export const performanceBudget = new PerformanceBudget();