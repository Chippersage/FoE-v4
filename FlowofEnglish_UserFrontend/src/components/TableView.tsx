import { useState, useEffect, useRef } from 'react';
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ExportButtons from './ExportButtons';
// Define table styles
const tableStyles = {
    tableContainer: {
      width: '100%',
      overflowX: 'auto'
    },
    table: {
      fontSize: '14px',
      color: '#333333',
      width: '100%',
      borderWidth: '1px',
      borderColor: '#87ceeb',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      fontSize: '14px',
      backgroundColor: '#87ceeb',
      borderWidth: '1px',
      padding: '8px',
      borderStyle: 'solid',
      borderColor: '#87ceeb',
      textAlign: 'left'
    },
    tableRow: {
      backgroundColor: '#ffffff',
      '&:hover': {
        backgroundColor: '#e0ffff'
      }
    },
    tableCell: {
      fontSize: '14px',
      borderWidth: '1px',
      padding: '8px',
      borderStyle: 'solid',
      borderColor: '#87ceeb'
    }
  };

   // Table view component
   const ProgressDataTable = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'leaderboardScore', direction: 'desc' });
    const [hoveredHeader, setHoveredHeader] = useState(null);
    const tableRef = useRef(null);

    if (!data || !data.users || data.users.length === 0) {
      return <Typography variant="body1">No data available</Typography>;
    }

     // Get the first user to determine total counts
  const firstUser = data.users.find(user => user.userId !== 'All Learners');
  const totals = {
    stages: firstUser?.totalStages || 0,
    units: firstUser?.totalUnits || 0,
    subconcepts: firstUser?.totalSubconcepts || 0
  };

// Enhanced table styles with sorting indicators
  const enhancedTableStyles = {
    ...tableStyles,
    tableHeader: {
      ...tableStyles.tableHeader,
      cursor: 'pointer',
      position: 'relative',
      userSelect: 'none',
      transition: 'background-color 0.2s ease',
      
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px',
    },
    sortIndicator: {
      marginLeft: '8px',
      fontSize: '14px',
      opacity: 0.8,
    },
    sortActive: {
      backgroundColor: '#5fb2d9',
    },
    headerHover: {
      backgroundColor: '#a8e1fa',
    },
    totalCount: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '4px',
    }
  };

    // Sorting function
  const sortedUsers = [...data.users]
    .filter(user => user.userId !== 'All Learners')
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
 // Column configuration
 const columns = [
  { key: 'userId', label: 'Learner ID', sortable: true },
  { key: 'userName', label: 'Learner Name', sortable: true },
  { key: 'completedStages', label: 'Completed Stages', total: totals.stages, sortable: true },
  { key: 'completedUnits', label: 'Completed Units', total : totals.units, sortable: true },
  { key: 'completedSubconcepts', label: 'Completed Subconcepts', total: totals.subconcepts, sortable: true },
  { key: 'leaderboardScore', label: 'Leaderboard Score', sortable: true }
];

// Handle sorting
const handleSort = (key) => {
  setSortConfig((prevConfig) => ({
    key,
    direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
  }));
};

// Get sort indicator
const getSortIndicator = (key) => {
  if (sortConfig.key !== key) return '↕';
  return sortConfig.direction === 'asc' ? '↑' : '↓';
};

// Get header style
const getHeaderStyle = (key) => {
  let style = { ...enhancedTableStyles.tableHeader };
  
  if (sortConfig.key === key) {
    style = { ...style, ...enhancedTableStyles.sortActive };
  }
  
  if (hoveredHeader === key) {
    style = { ...style, ...enhancedTableStyles.headerHover };
  }
  
  return style;
};

    // Function to handle row hover effect
    const handleRowHover = (event) => {
      event.currentTarget.style.backgroundColor = '#e0ffff';
    };
    
    const handleRowLeave = (event) => {
      event.currentTarget.style.backgroundColor = '#ffffff';
    };

    
      return (
        <div className="w-full overflow-x-auto">
           {/* Table header with export button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Learners Progress</h2>
        <ExportButtons 
          componentRef={{ tableRef}}
          filename="learner_progress_data"
          exportType="table"
          allowedFormats={['csv']}
          tableData={data}
        />
      </div>
      
      {/* Table container */}
      <div className="w-full overflow-x-auto" ref={tableRef}>
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`
                      border border-sky-200 bg-sky-100 
                      ${sortConfig.key === column.key ? 'bg-sky-200' : ''} 
                      ${hoveredHeader === column.key ? 'bg-sky-50' : ''}
                      cursor-pointer select-none transition-colors duration-200
                    `}
                    onClick={() => column.sortable && handleSort(column.key)}
                    onMouseEnter={() => setHoveredHeader(column.key)}
                    onMouseLeave={() => setHoveredHeader(null)}
                  >
                    <div className="p-3 text-sm">
                      <div className="font-medium whitespace-nowrap flex items-center justify-between">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="ml-2 opacity-60">
                            {sortConfig.key === column.key 
                              ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                              : '↕'}
                          </span>
                        )}
                      </div>
                      {column.total && (
                        <div className="text-xs text-gray-600 mt-1">
                          Total: {column.total}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => (
                <tr
                  key={`${user.userId}-${index}`}
                  className="hover:bg-sky-50 transition-colors duration-200"
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className="border border-sky-200 p-3 text-sm"
                    >
                      {column.key === 'leaderboardScore'
                        ? user[column.key].toLocaleString()
                        : user[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      );
    };

    export default   ProgressDataTable;