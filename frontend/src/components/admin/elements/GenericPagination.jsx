// Pagination.jsx
import React from 'react';

const GenericPagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="adm-cus-pagination">
      <div className="adm-cus-pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      <div className="adm-cus-pagination-controls">
        <button 
          className="adm-cus-pagination-btn"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>
        <button 
          className="adm-cus-pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GenericPagination;