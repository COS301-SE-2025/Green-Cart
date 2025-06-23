export const footprintMock = {
  productId: 123,
  overallRating: 75.5, // Overall sustainability rating out of 100
  breakdown: [
    { 
      stage: "Energy Efficiency", 
      rating: 85.0,  
      percent: 22.5, // Percentage contribution to overall score
      description: "How efficiently the product uses energy during operation"
    },
    { 
      stage: "Sustainable Materials", 
      rating: 70.0,  
      percent: 18.5,
      description: "Use of eco-friendly and renewable materials in production"
    },
    { 
      stage: "Carbon Footprint", 
      rating: 65.0,  
      percent: 17.2,
      description: "CO₂ emissions throughout the product lifecycle"
    },
    { 
      stage: "Recyclability", 
      rating: 80.0,  
      percent: 21.2,
      description: "How easily the product can be recycled at end of life"
    },
    { 
      stage: "Durability", 
      rating: 78.0,  
      percent: 20.6,
      description: "Product lifespan and build quality assessment"
    }
  ]
};