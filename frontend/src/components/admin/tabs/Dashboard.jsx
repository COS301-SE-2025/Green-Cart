// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAdminMetrics, getDashboardData, calculateDashboardStats } from '../../../admin-services/adminService';
import toast from 'react-hot-toast';
import '../../styles/admin/tabs/Dashboard.css';

// Import components
import DashboardStatsGrid from '../elements/DashboardStatsGrid';
import DashboardMetricsChart from '../elements/DashboardMetricsChart';
import DashboardCategoriesChart from '../elements/DashboardCategoriesChart';
import GenericModal from '../elements/GenericModal'; // Import the new modal

// Import real icons
import retailerIcon from '../icons/retailerIcon.png';
import customerIcon from '../icons/customersIcon.png';
import verifiedIcon from '../icons/verifiedIcon.png';
import unverifiedIcon from '../icons/unverifiedIcon.png';

const Dashboard = () => {
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
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
  const [adminData, setAdminData] = useState({
    name: 'Unknown User',
    email: 'unknown@example.com'
  });

  useEffect(() => {
    // Load admin data from session storage
    const loadAdminData = () => {
      try {
        const adminInfo = sessionStorage.getItem('adminSession');
        if (adminInfo) {
          const parsedAdminData = JSON.parse(adminInfo);
          setAdminData({
            name: parsedAdminData.name || 'Admin User',
            email: parsedAdminData.email || 'admin@example.com'
          });
        }
      } catch (error) {
        console.error('Error loading admin data from session storage:', error);
        // Keep default values if error occurs
      }
    };
    loadAdminData();
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
          overview: {
            totalCustomers: users.total.toLocaleString(),
            newThisMonth: users.newThisMonth.toLocaleString(),
            activeCustomers: users.activeUsers.toLocaleString(),
            growthRate: `${users.growthRate >= 0 ? '+' : ''}${users.growthRate}%`
          },
          statistics: {
            averageOrderValue: users.averageOrderValue,
            topLocation: users.topLocation,
            weeklyChange: `${users.weeklyChange >= 0 ? '+' : ''}${users.weeklyChange} this week`
          },
          recentActivity: [
            { date: '2024-01-15', action: 'New registrations', count: 23 },
            { date: '2024-01-14', action: 'Profile updates', count: 45 },
            { date: '2024-01-13', action: 'Orders placed', count: 78 }
          ]
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
          overview: {
            totalRetailers: retailers.total.toLocaleString(),
            newThisMonth: retailers.newThisMonth.toLocaleString(),
            activeRetailers: retailers.activeRetailers.toLocaleString(),
            growthRate: `${retailers.growthRate >= 0 ? '+' : ''}${retailers.growthRate}%`
          },
          performance: {
            averageDeliveryTime: retailers.averageDeliveryTime,
            topCategory: retailers.topCategory,
            weeklyChange: `${retailers.weeklyChange >= 0 ? '+' : ''}${retailers.weeklyChange} this week`
          },
          topRetailers: [
            { name: 'Electronics Plus', revenue: 'R45,231', orders: 156 },
            { name: 'Fashion Forward', revenue: 'R38,945', orders: 134 },
            { name: 'Home & Garden Co', revenue: 'R32,678', orders: 98 }
          ]
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
          revenue: {
            totalRevenue: `R${verifiedProducts.totalRevenue}`,
            totalRevenueToRetailer: `R${verifiedProducts.totalRevenueToRetailer}`,
            averageProductValue: `R${(verifiedProducts.totalRevenue / verifiedProducts.total).toFixed(2)}`
          },
          inventory: {
            totalUnits: verifiedProducts.totalUnits.toLocaleString(),
            outOfStock: verifiedProducts.outOfStock.toLocaleString(),
            averageUnitsByRetailer: verifiedProducts.averageUnitsByRetailer.toLocaleString()
          },
          verification: {
            averageVerificationTime: verifiedProducts.averageVerificationTime,
            verificationRate: `${((verifiedProducts.total / (verifiedProducts.total + 450)) * 100).toFixed(1)}%`,
            weeklyVerified: verifiedProducts.weeklyChange.toString()
          }
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
          pending: {
            totalUnverified: unverifiedProducts.total.toLocaleString(),
            totalUnits: unverifiedProducts.totalUnits.toLocaleString(),
            averageWaitTime: unverifiedProducts.averageWaitTime
          },
          rejection: {
            rejected: unverifiedProducts.rejected.toLocaleString(),
            rejectionRate: unverifiedProducts.rejectionRate,
            changeRate: `${unverifiedProducts.growthRate >= 0 ? '+' : ''}${unverifiedProducts.growthRate}%`
          },
          categories: [
            { name: 'Electronics', pending: 89, rejected: 12 },
            { name: 'Clothing', pending: 76, rejected: 8 },
            { name: 'Home & Garden', pending: 45, rejected: 5 }
          ]
        }
      }
    ];
  };

  const statsCards = generateStatsCards();
  const categories = adminMetrics.top_categories || [];

  const handleCardClick = (card) => {
    setModalData(card.details);
    setModalTitle(`${card.title} Details`);
  };

  const closeModal = () => {
    setModalData(null);
    setModalTitle('');
  };

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-welcome-section">
          <h1 className="dashboard-welcome-title">Welcome back, {adminData.name}</h1>
          <p className="dashboard-welcome-subtitle">Here are the recent stats from greenCart!</p>
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

      {/* Generic Modal */}
      <GenericModal
        isOpen={!!modalData}
        onClose={closeModal}
        data={modalData}
        title={modalTitle}
      />
    </div>
  );
};

export default Dashboard;