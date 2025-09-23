import React, { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import GenericPagination from '../elements/GenericPagination';
import OrderStatsCards from '../elements/OrdersStatsCard';
import OrdersTable from '../elements/OrdersTable';
import '../../styles/admin/tabs/Orders.css';
import { getApiUrl, getLocalApiUrl } from '../../../config/api';

import exportIcon from '../icons/exportIcon.png';

const Orders = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [orders, setOrders] = useState([]);

	// Sort and Filter states
	const [sortBy, setSortBy] = useState('');
	const [sortOrder, setSortOrder] = useState('asc');
	const [filters, setFilters] = useState({
		status: [],
		dateRange: {
			start: '',
			end: ''
		}
	});
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);

	const itemsPerPage = 10;

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const apiUrl = getLocalApiUrl();
				const response = await fetch(`${apiUrl}/admin/orders/list`);
				const data = await response.json();
				if (response.ok) {
					setOrders(data.orders);
				} else {
					console.error('Error fetching orders:', data.message);
				}
			} catch (error) {
				console.error('Error fetching orders:', error);
			}
		};

		fetchOrders();
	}, []);

	// Filter and search functionality
	const getFilteredOrders = () => {
		let filtered = orders.filter(order => {
			// Search functionality - handle null/undefined values
			const matchesSearch = !searchTerm || 
				(order.order_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
				(order.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
				(order.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
				(order.state || '').toLowerCase().includes(searchTerm.toLowerCase());

			if (!matchesSearch) return false;

			// Status filter
			if (filters.status.length > 0) {
				if (!filters.status.includes(order.state)) return false;
			}

			// Date range filter
			if (filters.dateRange.start || filters.dateRange.end) {
				const orderDate = new Date(order.date);
				const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
				const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

				if (startDate && orderDate < startDate) return false;
				if (endDate && orderDate > endDate) return false;
			}

			return true;
		});

		return filtered;
	};

	// Sort functionality
	const getSortedOrders = (ordersList) => {
		if (!sortBy) return ordersList;

		return [...ordersList].sort((a, b) => {
			let aValue, bValue;

			switch (sortBy) {
				case 'orderId':
					aValue = (a.order_id || '').toString().toLowerCase();
					bValue = (b.order_id || '').toString().toLowerCase();
					break;
				case 'customer':
					aValue = (a.user_email || '').toLowerCase();
					bValue = (b.user_email || '').toLowerCase();
					break;
				case 'date':
					aValue = new Date(a.date || 0);
					bValue = new Date(b.date || 0);
					break;
				case 'status':
					aValue = (a.state || '').toLowerCase();
					bValue = (b.state || '').toLowerCase();
					break;
				case 'address':
					aValue = (a.address || '').toLowerCase();
					bValue = (b.address || '').toLowerCase();
					break;
				default:
					return 0;
			}

			if (sortBy === 'date') {
				return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
			} else {
				if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
				if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
				return 0;
			}
		});
	};

	// Get final filtered and sorted orders
	const filteredOrders = getSortedOrders(getFilteredOrders());

	// Calculate pagination based on filtered results
	const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filters, sortBy, sortOrder]);

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	const handleExport = () => {
		console.log('Export orders');
	};

	// Sort handlers
	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('asc');
		}
	};

	// Filter handlers
	const handleStatusFilter = (status) => {
		const newStatus = filters.status.includes(status)
			? filters.status.filter(s => s !== status)
			: [...filters.status, status];
		
		setFilters(prev => ({
			...prev,
			status: newStatus
		}));
	};

	const handleDateRangeFilter = (field, value) => {
		setFilters(prev => ({
			...prev,
			dateRange: {
				...prev.dateRange,
				[field]: value
			}
		}));
	};

	const clearFilters = () => {
		setFilters({
			status: [],
			dateRange: {
				start: '',
				end: ''
			}
		});
		setSortBy('');
		setSortOrder('asc');
		setSearchTerm('');
	};

	// Available filter options
	const statusOptions = ['Preparing Order', 'Ready for Delivery', 'In Transit', 'Delivered', 'Cancelled'];

	return (
		<div className="adm-ord-container">
			{/* Header */}
			<div className="adm-ord-header">
				<h1 className="adm-ord-title">Orders</h1>
				<div className="adm-ord-header-actions">
					<button className="adm-ord-export-btn" onClick={handleExport}>
						<img src={exportIcon} alt="Export" className="adm-ord-export-icon" />
						Export
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			<OrderStatsCards />

			{/* Search and Controls */}
			<div className="adm-ord-search-and-controls">
				<div className="adm-ord-search-container">
					<div className="adm-ord-search-wrapper">
						<svg className="adm-ord-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
							<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
							<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
						</svg>
						<input
							type="text"
							className="adm-ord-search-input"
							placeholder="Search orders..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>

				<div className="adm-ord-control-buttons">
					{/* Filter Dropdown */}
					<Dropdown show={showFilterDropdown} onToggle={setShowFilterDropdown}>
						<Dropdown.Toggle 
							variant="outline-secondary" 
							id="filter-dropdown"
							className="adm-ord-filter-btn"
						>
							Filter by
						</Dropdown.Toggle>
						<Dropdown.Menu className="adm-ord-filter-menu">
							<div className="filter-section">
								<h6>Status</h6>
								{statusOptions.map(status => (
									<div key={status} className="filter-checkbox">
										<input
											type="checkbox"
											id={`status-${status}`}
											checked={filters.status.includes(status)}
											onChange={() => handleStatusFilter(status)}
										/>
										<label htmlFor={`status-${status}`}>{status}</label>
									</div>
								))}
							</div>

							<div className="filter-section">
								<h6>Date Range</h6>
								<div className="filter-date-range">
									<input
										type="date"
										value={filters.dateRange.start}
										onChange={(e) => handleDateRangeFilter('start', e.target.value)}
										placeholder="Start date"
									/>
									<span>to</span>
									<input
										type="date"
										value={filters.dateRange.end}
										onChange={(e) => handleDateRangeFilter('end', e.target.value)}
										placeholder="End date"
									/>
								</div>
							</div>

							<div className="filter-actions">
								<button onClick={clearFilters} className="clear-filters-btn">
									Clear All
								</button>
							</div>
						</Dropdown.Menu>
					</Dropdown>

					{/* Sort Dropdown */}
					<Dropdown>
						<Dropdown.Toggle 
							variant="outline-secondary" 
							id="sort-dropdown"
							className="adm-ord-sort-btn"
						>
							Sort by {sortBy && `(${sortBy} ${sortOrder})`}
						</Dropdown.Toggle>
						<Dropdown.Menu className="adm-ord-sort-menu">
							<Dropdown.Item onClick={() => handleSort('orderId')}>
								Order ID {sortBy === 'orderId' && (sortOrder === 'asc' ? '↑' : '↓')}
							</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSort('customer')}>
								Customer {sortBy === 'customer' && (sortOrder === 'asc' ? '↑' : '↓')}
							</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSort('date')}>
								Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
							</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSort('status')}>
								Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
							</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSort('address')}>
								Address {sortBy === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>

			{/* Table */}
			<OrdersTable orders={paginatedOrders} />

			{/* Pagination */}
			<GenericPagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredOrders.length}
				itemsPerPage={itemsPerPage}
			/>
		</div>
	);
};

export default Orders;