import React, { useState } from 'react';
import GenericPagination from '../elements/GenericPagination';
import OrderStatsCards from '../elements/OrdersStatsCard';
import OrdersTable from '../elements/OrdersTable';
import AdminOrderDetailsModal from '../modals/AdminOrderDetailsModal';
import toast from 'react-hot-toast';
import '../../styles/admin/tabs/Orders.css';

import exportIcon from '../icons/exportIcon.png';

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState('table');
  const [orderFilter, setOrderFilter] = useState('On Delivery');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Mock data - you would replace this with actual data
  const [orders, setOrders] = useState([
    {
      orderId: '#0014ABCD',
      customer: 'Theresa',
      date: '17 May 2025',
      address: '32 Danmondi → 82 Subidbaz',
      status: 'Pending'
    },
    {
      orderId: '#0013ABGS',
      customer: 'Devon',
      date: '18 May 2025',
      address: '21 Savar → 24 New Market',
      status: 'Shipping'
    },
    {
      orderId: '#0016ABLL',
      customer: 'Cameron',
      date: '18 May 2025',
      address: 'Devtakhum → Dhaka 1120',
      status: 'Delivered'
    },
    {
      orderId: '#0018ABAA',
      customer: 'Darlene',
      date: '17 May 2025',
      address: '42 Dulukahpa → 82 Subidbaz',
      status: 'Returned'
    },
    {
      orderId: '#0013ABGG',
      customer: 'Darlene',
      date: '14 May 2025',
      address: '64 Handipas → 212 Laksam',
      status: 'Shipping'
    }
  ]);

  const totalPages = Math.ceil(orders.length / 10);
  const itemsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    console.log('Export orders');
  };

   const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderState = async (orderId, newState) => {
    try {
      // TODO: Replace with actual API call
      // await updateOrderState(orderId, newState);
      
      // Mock update - update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newState }
            : order
        )
      );

      console.log(`Updating order ${orderId} to state: ${newState}`);
      toast.success(`Order ${orderId} updated to ${newState}`);
      
    } catch (error) {
      console.error('Error updating order state:', error);
      throw new Error('Failed to update order state');
    }
  };

  const orderTabs = ['On Delivery', 'Pending', 'Shipping', 'Delivered', 'Canceled', 'Returned'];


  return (
    <div className="adm-ord-container">
      {/* Header */}
      <div className="adm-ord-header">
        <h1 className="adm-ord-title">Orders</h1>
        <div className="adm-ord-header-actions">
          <button className="adm-ord-export-btn" onClick={handleExport}>
            {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
            </svg> */}
            <img src={exportIcon} alt="Export" className="adm-ord-export-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <OrderStatsCards />

      {/* Order Tabs */}
      <div className="adm-ord-tabs">
        {orderTabs.map((tab) => (
          <button
            key={tab}
            className={`adm-ord-tab ${orderFilter === tab ? 'active' : ''}`}
            onClick={() => setOrderFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Controls */}
      <div className="adm-ord-search-and-controls">
        <div className="adm-ord-search-container">
          <div className="adm-ord-search-wrapper">
            <svg className="adm-ord-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              className="adm-ord-search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="adm-ord-control-buttons">
          <button className="adm-ord-filter-btn">
            Filter by
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button className="adm-ord-sort-btn">
            Sort by
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <OrdersTable orders={orders} onOrderClick={handleOrderClick}/>

      {/* Pagination */}
      <GenericPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={orders.length}
        itemsPerPage={itemsPerPage}
      />

       {/* Order Details Modal */}
      <AdminOrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
        onUpdateOrderState={handleUpdateOrderState}
      />
    </div>
  );
};

export default Orders;