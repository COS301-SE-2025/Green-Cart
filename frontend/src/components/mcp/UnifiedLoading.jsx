import React from 'react';
import '../styles/mcp/mcp.css';

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
    <div className="mcp-unified-loading">
      <div className="mcp-unified-loading-spinner"></div>
      <div className="mcp-unified-loading-text">
        <span className="mcp-unified-loading-main">{main}</span>
        <span className="mcp-unified-loading-sub">{sub}</span>
      </div>
    </div>
  );
};

export default UnifiedLoading;