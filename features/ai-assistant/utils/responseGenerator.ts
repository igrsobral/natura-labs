import { QueryAnalysis } from "./queryProcessor";

const TEST_DATA = {
  brands: {
    "Lifestyle Brand A": {
      totalSales: 660, // 120+150+180+210 (excluding null)
      averageSales: 165, // (120+150+180+210)/4
      categories: {
        Fitness: {
          sales: [120, 150, 180, null, 210],
          average: 165,
          total: 660,
        },
        Recovery: {
          sales: [90, 100, 85, 110, null],
          average: 96.25,
          total: 385,
        },
      },
    },
    "Fashion Brand A": {
      totalSales: 1780, // 1515+265
      averageSales: 184.5, // (1515+265)/10 weeks with data
      categories: {
        Supplements: {
          sales: [300, 280, 310, 295, 330],
          average: 303,
          total: 1515,
        },
        Gear: { sales: [50, null, 65, 70, 80], average: 66.25, total: 265 },
      },
    },
  },
  categories: {
    Fitness: {
      totalSales: 660,
      average: 165,
      leadingBrand: "Lifestyle Brand A",
      nullWeek: "Week 4",
    },
    Recovery: {
      totalSales: 385,
      average: 96.25,
      leadingBrand: "Lifestyle Brand A",
      nullWeek: "Week 5",
    },
    Supplements: {
      totalSales: 1515,
      average: 303,
      leadingBrand: "Fashion Brand A",
      nullWeek: null,
    },
    Gear: {
      totalSales: 265,
      average: 66.25,
      leadingBrand: "Fashion Brand A",
      nullWeek: "Week 2",
    },
  },
  weeklyTotals: {
    "Week 1": 560, // 120+90+300+50
    "Week 2": 530, // 150+100+280+(null excluded)
    "Week 3": 640, // 180+85+310+65
    "Week 4": 475, // (null excluded)+110+295+70
    "Week 5": 620, // 210+(null excluded)+330+80
  },
};

// Generate responses based on query analysis
export const generateContextualResponse = (
  query: string,
  analysis: QueryAnalysis
): string => {
  const { category } = analysis;

  switch (category) {
    case "brand":
      return generateBrandResponse(query);

    case "comparison":
      return generateComparisonResponse(query);

    case "trend":
      return generateTrendResponse(query);

    case "forecast":
      return generateForecastResponse(query);

    case "performance":
      return generatePerformanceResponse(query);

    default:
      return generateGeneralResponse();
  }
};

const generateBrandResponse = (query: string): string => {
  // Handle "Brand A" queries by mapping to test data brands
  const queryLower = query.toLowerCase();

  if (
    queryLower.includes("brand a trends") ||
    queryLower.includes("show me brand a")
  ) {
    return "Mila would return a filtered chart for Lifestyle Brand A showing Fitness and Recovery categories. Fitness averages 165 per week with strong performance (120-210 range), while Recovery averages 96.25 with consistent mid-range performance (85-110 range). Note: Fitness has missing data in Week 4, Recovery in Week 5.";
  }

  // Check for specific brand mentions
  const lifestyleBrand =
    queryLower.includes("lifestyle brand a") ||
    queryLower.includes("lifestyle");
  const fashionBrand =
    queryLower.includes("fashion brand a") || queryLower.includes("fashion");

  if (lifestyleBrand) {
    const brandData = TEST_DATA.brands["Lifestyle Brand A"];
    return `Lifestyle Brand A focuses on wellness with Fitness (avg: ${brandData.categories.Fitness.average}) and Recovery (avg: ${brandData.categories.Recovery.average}) categories. Total performance: ${brandData.totalSales} across all weeks. Fitness shows stronger performance but has a data gap in Week 4.`;
  }

  if (fashionBrand) {
    const brandData = TEST_DATA.brands["Fashion Brand A"];
    return `Fashion Brand A excels in health products with Supplements (avg: ${brandData.categories.Supplements.average}) and Gear (avg: ${brandData.categories.Gear.average}) categories. Supplements show exceptional consistency with the highest average performance, while Gear has missing data in Week 2.`;
  }

  return "I can analyze Lifestyle Brand A (Fitness, Recovery) or Fashion Brand A (Supplements, Gear). Try asking 'Show me Brand A trends' or specify a brand name.";
};

const generateComparisonResponse = (query: string): string => {
  const queryLower = query.toLowerCase();

  if (queryLower.includes("category") || queryLower.includes("categories")) {
    const categories = Object.entries(TEST_DATA.categories)
      .sort(([, a], [, b]) => b.totalSales - a.totalSales)
      .map(
        ([cat, data]) =>
          `${cat}: ${data.totalSales} total (avg: ${data.average}, led by ${data.leadingBrand})`
      )
      .join(", ");

    return `Category comparison shows: ${categories}. Supplements leads significantly, followed by Fitness. Note data gaps: ${TEST_DATA.categories.Fitness.nullWeek} for Fitness, ${TEST_DATA.categories.Recovery.nullWeek} for Recovery, ${TEST_DATA.categories.Gear.nullWeek} for Gear.`;
  }

  const brands = Object.entries(TEST_DATA.brands)
    .sort(([, a], [, b]) => b.totalSales - a.totalSales)
    .map(
      ([brand, data]) =>
        `${brand}: ${data.totalSales} total (avg: ${data.averageSales.toFixed(1)})`
    )
    .join(", ");

  return `Brand comparison: ${brands}. Fashion Brand A leads with Supplements driving high performance, while Lifestyle Brand A focuses on wellness categories.`;
};

const generateTrendResponse = (query: string): string => {
  const queryLower = query.toLowerCase();

  if (queryLower.includes("fitness")) {
    const fitnessData = TEST_DATA.categories.Fitness;
    return `Fitness trends show strong performance averaging ${fitnessData.average} per week. Data shows growth from 120 to 210 (Week 1 to Week 5), with missing data in ${fitnessData.nullWeek}. Lifestyle Brand A dominates this category.`;
  }

  if (queryLower.includes("recovery")) {
    const recoveryData = TEST_DATA.categories.Recovery;
    return `Recovery trends show consistent mid-range performance averaging ${recoveryData.average} per week. Range: 85-110 with missing data in ${recoveryData.nullWeek}. Stable performance by Lifestyle Brand A.`;
  }

  if (queryLower.includes("supplements")) {
    const supplementsData = TEST_DATA.categories.Supplements;
    return `Supplements trends show exceptional consistency averaging ${supplementsData.average} per week. Fashion Brand A maintains strong performance (280-330 range) with no missing data - the most reliable category.`;
  }

  if (queryLower.includes("gear")) {
    const gearData = TEST_DATA.categories.Gear;
    return `Gear trends show moderate performance averaging ${gearData.average} per week. Range: 50-80 with missing data in ${gearData.nullWeek}. Fashion Brand A shows growth potential in this category.`;
  }

  return `Overall trends: Supplements leads (avg: 303), Fitness strong (avg: 165), Recovery stable (avg: 96.25), Gear growing (avg: 66.25). Weekly totals range from 475-640, with data gaps affecting some weeks.`;
};

const generateForecastResponse = (query: string): string => {
  const queryLower = query.toLowerCase();
  const timeframe = queryLower.includes("quarter")
    ? "next quarter"
    : queryLower.includes("year")
      ? "next year"
      : "upcoming period";

  if (queryLower.includes("supplements")) {
    return `Supplements forecast for ${timeframe}: Projected continued strong performance based on consistent 280-330 range. Fashion Brand A expected to maintain leadership with potential 10-15% growth given no data gaps.`;
  }

  if (queryLower.includes("fitness")) {
    return `Fitness forecast for ${timeframe}: Strong growth trajectory from 120 to 210 suggests 15-20% potential increase. Address Week 4 data gap for more accurate projections. Lifestyle Brand A well-positioned.`;
  }

  return `Market forecast for ${timeframe}: Supplements expected to maintain dominance (300+ avg), Fitness shows growth potential (170+ projected), Recovery stable (95-100 range), Gear emerging (70+ potential). Address data gaps for improved accuracy.`;
};

const generatePerformanceResponse = (query: string): string => {
  const queryLower = query.toLowerCase();
  const isLookingForBest =
    queryLower.includes("best") ||
    queryLower.includes("top") ||
    queryLower.includes("highest");

  if (isLookingForBest) {
    return `Top performers: Supplements category leads with 303 average (Fashion Brand A), followed by Fitness at 165 average (Lifestyle Brand A). Fashion Brand A has highest total sales (1780), while Supplements shows most consistent performance with no data gaps.`;
  } else {
    return `Areas for improvement: Gear category shows lowest performance at 66.25 average with data gap in Week 2. Recovery category stable but could benefit from growth strategies. Address missing data points to improve overall analytics accuracy.`;
  }
};

const generateGeneralResponse = (): string => {
  const responses = [
    "I can help you analyze sales data for Lifestyle Brand A (Fitness, Recovery) and Fashion Brand A (Supplements, Gear). Try asking about specific brand performance or category comparisons.",
    "Ask me about 'Show me Brand A trends', specific categories like Fitness or Supplements, or compare performance across brands.",
    "I can provide insights on Fitness, Recovery, Supplements, and Gear categories. Note: some categories have missing data in specific weeks.",
    "Try queries like 'Compare all brands', 'Show me Brand A trends', 'Supplements performance', or 'Fitness trends'.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

// Generate follow-up questions based on the response
export const generateFollowUpQuestions = (
  query: string,
  analysis: QueryAnalysis
): string[] => {
  const followUps: string[] = [];
  const queryLower = query.toLowerCase();

  switch (analysis.category) {
    case "brand":
      if (queryLower.includes("lifestyle")) {
        followUps.push("How does Fitness compare to Recovery?");
        followUps.push("What's causing the Week 4 data gap in Fitness?");
        followUps.push("Compare Lifestyle Brand A to Fashion Brand A");
      } else if (queryLower.includes("fashion")) {
        followUps.push("Why do Supplements perform so consistently?");
        followUps.push("What's the growth potential for Gear?");
        followUps.push("How does Fashion Brand A compare overall?");
      } else {
        followUps.push("Tell me about Lifestyle Brand A");
        followUps.push("Show me Fashion Brand A performance");
        followUps.push("Compare both brands");
      }
      break;

    case "comparison":
      followUps.push("Which category has the most consistent data?");
      followUps.push("What factors contribute to Supplements' success?");
      followUps.push("How do missing data points affect comparisons?");
      break;

    case "trend":
      followUps.push("What's causing the data gaps?");
      followUps.push("Which trends are most reliable?");
      followUps.push("How do weekly totals compare?");
      break;

    case "forecast":
      followUps.push("How do data gaps affect forecasts?");
      followUps.push("Which categories are most predictable?");
      followUps.push("What could improve forecast accuracy?");
      break;

    case "performance":
      followUps.push("How can we improve lower-performing categories?");
      followUps.push("What makes Supplements so successful?");
      followUps.push("How do data gaps impact performance analysis?");
      break;

    default:
      followUps.push("Show me Brand A trends");
      followUps.push("Compare Supplements and Fitness");
      followUps.push("Tell me about data gaps");
  }

  return followUps.slice(0, 3); // Return top 3 follow-ups
};
