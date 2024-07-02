import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './Dashboard.css';  // Import the CSS file
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title
);
// // Setting an integer variable in sessionStorage
// var count = 1;
// sessionStorage.setItem('cKey', count.toString());
const Dashboard = () => {
    const [apiData, setApiData] = useState([]);
    const [browserData, setBrowserData] = useState({});
    const [criteriaData, setCriteriaData] = useState({});
    const [selectedCriteria, setSelectedCriteria] = useState('request_type');
    //const history = useHistory();
    const logApiHit = () => {
      fetch('/log', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              id: 'R00', //+parseInt(sessionStorage.getItem('cKey')),
              request_id: "get-items",
              request_type: 'GET',
              payload: '',
              content_type: 'application/json',
              os: 'Windows'
          }),
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          window.location.reload(); // Reload the page after successful API call
          sessionStorage.setItem('cKey', parseInt(sessionStorage.getItem('intKey'))+1);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  };
    useEffect(() => {
        fetch('/api/data')
            .then(response => response.json())
            .then(data => {
                setApiData(data);
                const browserCounts = data.reduce((acc, hit) => {
                    acc[hit.user_agent] = (acc[hit.user_agent] || 0) + 1;
                    return acc;
                }, {});
                setBrowserData(browserCounts);

                const criteriaCounts = data.reduce((acc, hit) => {
                    acc[hit.request_type] = (acc[hit.request_type] || 0) + 1;
                    return acc;
                }, {});
                setCriteriaData(criteriaCounts);
                updateCriteriaData(data, selectedCriteria);
                // Redirect to '/api/data' after fetching data
            });
    }, []);
    useEffect(() => {
      updateCriteriaData(apiData, selectedCriteria);
  }, [selectedCriteria]);

  const updateCriteriaData = (data, criteria) => {
      const counts = data.reduce((acc, hit) => {
          acc[hit[criteria]] = (acc[hit[criteria]] || 0) + 1;
          return acc;
      }, {});
      setCriteriaData(counts);
  };

  const handleCriteriaChange = (event) => {
      setSelectedCriteria(event.target.value);
  };

    const columns = React.useMemo(
        () => [
          { Header: 'ID', accessor: 'id' },
          { Header: 'Request ID', accessor: 'request_id' },
          { Header: 'Request Type', accessor: 'request_type' },
          { Header: 'Request Time', accessor: 'request_time' },
          { Header: 'Payload', accessor: 'payload' },
          { Header: 'Content Type', accessor: 'content_type' },
          { Header: 'IP Address', accessor: 'ip_address' },
          { Header: 'OS', accessor: 'os' },
          { Header: 'User Agent', accessor: 'user_agent' }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: apiData });
    return (
      <div>
          <h1>API Hit Analytics Dashboard</h1>
          <button onClick={logApiHit}>Log API Hit</button>
          <div className="chart-container">
            <h2>Dashboard</h2>
              <div>
                  <Pie
                      data={{
                          labels: Object.keys(browserData),
                          datasets: [{
                              data: Object.values(browserData),
                              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                          }]
                      }}
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                              legend: {
                                  position: 'bottom',
                              },
                          },
                      }}
                      width={400}
                      height={400}
                  />
              </div>
              
              <div className="criteria-selector">
                <label htmlFor="criteria">Select Criteria: </label>
                <select id="criteria" value={selectedCriteria} onChange={handleCriteriaChange}>
                    <option value="request_type">Request Type</option>
                    <option value="request_time">Request Time</option>
                    <option value="ip_address">IP Address</option>
                    <option value="os">Operating System</option>
                    <option value="user_agent">User Agent</option>
                </select>
                  <Bar
                      data={{
                          labels: Object.keys(criteriaData),
                          datasets: [{
                              data: Object.values(criteriaData),
                              backgroundColor: '#36A2EB'
                          }]
                      }}
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                              legend: {
                                  position: 'bottom',
                              },
                          },
                      }}
                      width={400}
                      height={400}
                  />
              </div>
          </div>
          <div className="table-container">
          <h2>Requests List</h2>
              <table {...getTableProps()}>
                  <thead>
                      {headerGroups.map(headerGroup => (
                          <tr {...headerGroup.getHeaderGroupProps()}>
                              {headerGroup.headers.map(column => (
                                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                              ))}
                          </tr>
                      ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                      {rows.map(row => {
                          prepareRow(row);
                          return (
                              <tr {...row.getRowProps()}>
                                  {row.cells.map(cell => (
                                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                  ))}
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
  );
};

export default Dashboard;
