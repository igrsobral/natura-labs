import { SalesData } from '../shared/types'

// Exact test data structure as specified in the Natura Labs test requirements
export const sampleData: SalesData = {
  brands: [
    {
      name: "Lifestyle Brand A",
      categories: [
        { 
          name: "Fitness", 
          sales: [120, 150, 180, null, 210] 
        },
        { 
          name: "Recovery", 
          sales: [90, 100, 85, 110, null] 
        }
      ]
    },
    {
      name: "Fashion Brand A",
      categories: [
        { 
          name: "Supplements", 
          sales: [300, 280, 310, 295, 330] 
        },
        { 
          name: "Gear", 
          sales: [50, null, 65, 70, 80] 
        }
      ]
    }
  ],
  dateRange: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
}