// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAdminMetrics, getDashboardData, calculateDashboardStats } from '../../../admin-services/adminService';
import toast from 'react-hot-toast';
import '../../styles/admin/tabs/Dashboard.css';

// Import components
import DashboardStatsGrid from '../elements/DashboardStatsGrid';
import DashboardMetricsChart from '../elements/DashboardMetricsChart';
import DashboardCategoriesChart from '../elements/DashboardCategoriesChart';

// Import real icons
import retailerIcon from '../icons/retailerIcon.png';
import customerIcon from '../icons/customersIcon.png';
import verifiedIcon from '../icons/verifiedIcon.png';
import unverifiedIcon from '../icons/unverifiedIcon.png';

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState({
    total_users: 0,
    total_retailers: 0,
    total_products: 0,
    verified_products: 0,
    unverified_products: 0,
    recent_orders: 0,
    active_retailers: 0,
    top_categories: [],
    monthly_orders: []
  });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setMetricsLoading(true);
    
    try {
      const [metricsResponse, dashboardDataResponse] = await Promise.all([
        getAdminMetrics(),
        getDashboardData()
      ]);

      if (metricsResponse) {
        setAdminMetrics(metricsResponse);
        setMetricsLoading(false);
      }

      if (dashboardDataResponse) {
        const stats = calculateDashboardStats(dashboardDataResponse);
        setDashboardStats(stats);
        setStatsLoading(false);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setMetricsLoading(false);
    }
  };

  // Generate stats cards from real data
  const generateStatsCards = () => {
    if (!dashboardStats) return [];

    const { users, retailers, verifiedProducts, unverifiedProducts } = dashboardStats;

    return [
      {
        id: 1,
        title: 'Total Customers',
        subtitle: `${users.newThisMonth} From South Africa`,
        value: users.total.toLocaleString(),
        percentage: `${users.growthRate >= 0 ? '+' : ''}${users.growthRate}%`,
        change: `${users.weeklyChange >= 0 ? '+' : ''}${users.weeklyChange} this week`,
        trend: users.growthRate >= 0 ? 'up' : 'down',
        icon: customerIcon,
        dark: true,
        details: {
          totalCustomers: users.total.toLocaleString(),
          newThisMonth: users.newThisMonth.toLocaleString(),
          activeCustomers: users.activeUsers.toLocaleString(),
          averageOrderValue: users.averageOrderValue,
          topLocation: users.topLocation,
          growthRate: `${users.growthRate >= 0 ? '+' : ''}${users.growthRate}%`
        }
      },
      {
        id: 2,
        title: 'Total Retailers',
        subtitle: `${retailers.activeRetailers} Active Retailers`,
        value: retailers.total.toLocaleString(),
        percentage: `${retailers.growthRate >= 0 ? '+' : ''}${retailers.growthRate}%`,
        change: `${retailers.weeklyChange >= 0 ? '+' : ''}${retailers.weeklyChange} this week`,
        trend: retailers.growthRate >= 0 ? 'up' : 'down',
        icon: retailerIcon,
        dark: true,
        details: {
          totalRetailers: retailers.total.toLocaleString(),
          newThisMonth: retailers.newThisMonth.toLocaleString(),
          activeRetailers: retailers.activeRetailers.toLocaleString(),
          averageDeliveryTime: retailers.averageDeliveryTime,
          topCategory: retailers.topCategory,
          growthRate: `${retailers.growthRate >= 0 ? '+' : ''}${retailers.growthRate}%`
        }
      },
      {
        id: 3,
        title: 'Verified Products',
        subtitle: 'Latest verified: 21 hrs ago',
        value: verifiedProducts.total.toLocaleString(),
        percentage: `${verifiedProducts.growthRate >= 0 ? '+' : ''}${verifiedProducts.growthRate}%`,
        change: `${verifiedProducts.weeklyChange >= 0 ? '+' : ''}${verifiedProducts.weeklyChange}`,
        trend: verifiedProducts.growthRate >= 0 ? 'up' : 'down',
        icon: verifiedIcon,
        dark: true,
        details: {
          totalRevenue: `R${verifiedProducts.totalRevenue}`,
          totalRevenueToRetailer: `R${verifiedProducts.totalRevenueToRetailer}`,
          outOfStock: verifiedProducts.outOfStock.toLocaleString(),
          totalUnits: verifiedProducts.totalUnits.toLocaleString(),
          averageUnitsByRetailer: verifiedProducts.averageUnitsByRetailer.toLocaleString(),
          averageVerificationTime: verifiedProducts.averageVerificationTime
        }
      },
      {
        id: 4,
        title: 'Unverified Products',
        subtitle: 'Awaiting Review',
        value: unverifiedProducts.total.toLocaleString(),
        percentage: `${unverifiedProducts.growthRate >= 0 ? '+' : ''}${unverifiedProducts.growthRate}%`,
        change: `${unverifiedProducts.weeklyChange >= 0 ? '+' : ''}${unverifiedProducts.weeklyChange}`,
        trend: unverifiedProducts.growthRate >= 0 ? 'up' : 'down',
        icon: unverifiedIcon,
        dark: true,
        details: {
          totalUnverified: unverifiedProducts.total.toLocaleString(),
          totalUnits: unverifiedProducts.totalUnits.toLocaleString(),
          rejected: unverifiedProducts.rejected.toLocaleString(),
          averageWaitTime: unverifiedProducts.averageWaitTime,
          rejectionRate: unverifiedProducts.rejectionRate,
          changeRate: `${unverifiedProducts.growthRate >= 0 ? '+' : ''}${unverifiedProducts.growthRate}%`
        }
      }
    ];
  };

  const statsCards = generateStatsCards();
  const categories = adminMetrics.top_categories || [];

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-welcome-section">
          <h1 className="dashboard-welcome-title">Welcome back, Matthew</h1>
          <p className="dashboard-welcome-subtitle">Here are today's stats from your online store!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStatsGrid 
        statsCards={statsCards}
        onCardClick={handleCardClick}
        loading={statsLoading}
      />

      {/* Charts Section */}
      <div className="charts-section">
        <DashboardMetricsChart 
          adminMetrics={adminMetrics}
          loading={metricsLoading}
        />
        <DashboardCategoriesChart 
          categories={categories}
          loading={metricsLoading}
        />
      </div>

      {/* Modal Overlay */}
      {selectedCard && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{selectedCard.title} Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-stats-grid">
                {Object.entries(selectedCard.details).map(([key, value]) => (
                  <div key={key} className="modal-stat-item">
                    <span className="modal-stat-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="modal-stat-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;