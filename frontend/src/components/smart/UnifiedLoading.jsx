import React from 'react';
import '../styles/smart/smart.css';

export const UnifiedLoading = ({ 
  mainText = "Loading...", 
  subText = "Please wait while we fetch your data",
  type = "recommendations" // "recommendations", "analysis", "alternatives", "impact"
}) => {
  const getLoadingText = () => {
    switch (type) {
      case "recommendations":
        return {
          main: "🌱 Generating AI-Powered Recommendations",
          sub: "Analyzing your preferences and sustainability profile..."
        };
      case "analysis":
        return {
          main: "📊 Analyzing Product Sustainability",
          sub: "Evaluating environmental impact and certifications..."
        };
      case "alternatives":
        return {
          main: "🔍 Finding Better Alternatives",
          sub: "Searching for more sustainable options..."
        };
      case "impact":
        return {
          main: "📈 Calculating Eco-Meter Impact",
          sub: "Computing environmental benefits..."
        };
      default:
        return { main: mainText, sub: subText };
    }
  };

  const { main, sub } = getLoadingText();

  return (
    <div className="smart-unified-loading">
      <div className="smart-unified-loading-spinner"></div>
      <div className="smart-unified-loading-text">
        <span className="smart-unified-loading-main">{main}</span>
        <span className="smart-unified-loading-sub">{sub}</span>
      </div>
    </div>
  );
};

export default UnifiedLoading;
