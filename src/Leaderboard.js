import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChartLine,
  faFileExcel,
  faTv,
  faNewspaper,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "./components/Footer";
import Navbar1 from "./components/Navbar1";
import './App.css';
import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Leaderboard = () => {
  const [name, setName] = useState("");
  const [testname, setTestname] = useState("");
  const [dept, setDept] = useState("");
  const [score, setScore] = useState("");
  const [ldata, setLdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState("score");
  const [sortDirection, setSortDirection] = useState("asc");
  const rowsPerPage = 20;

  useEffect(() => {
    axios.get("http://localhost:5000/leaderboard/")
      .then(res => {
        setLdata(res.data);
        setFilteredData(res.data);  // Initialize filteredData with all data
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const filtered = ldata.filter((item) => {
      return (
        (name === "" || item.user_id.toLowerCase().includes(name.toLowerCase())) &&
        (testname === "" || item.test_name.toLowerCase().includes(testname.toLowerCase())) &&
        (dept === "" || item.department.toLowerCase().includes(dept.toLowerCase())) &&
        (score === "" || String(item.score).includes(score))
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const getTimeInSeconds = (timeString) => {
        if (!timeString) return 0; // Handle null or undefined time strings
        const [minutes, seconds] = timeString.split(":").map(Number);
        return minutes * 60 + seconds;
      };

      const fieldA = sortCriteria === "total_time" ? getTimeInSeconds(a.complete) : a[sortCriteria];
      const fieldB = sortCriteria === "total_time" ? getTimeInSeconds(b.complete) : b[sortCriteria];

      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });

    setFilteredData(sorted);
    setCurrentPage(1);  // Reset to the first page on search
  }, [name, testname, dept, score, ldata, sortCriteria, sortDirection]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Leaderboard', 20, 10);

    const tableColumn = ["Student ID", "Email", "Test Name", "Department", "Score"];
    const tableRows = [];

    filteredData.forEach(item => {
      const itemData = [
        item.user_id,
        item.email,
        item.test_name,
        item.department,
        item.score,
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('leaderboard.pdf');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortCriteriaChange = (event) => {
    setSortCriteria(event.target.value);
  };

  const handleSortDirectionChange = (event) => {
    setSortDirection(event.target.value);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div>
      <Navbar1 />
      <div className="center-container">
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>Leaderboard</h1>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "20px" }}>
          Discover achievements and rivals on our vibrant leaderboard - your hub
          for tracking scores and embracing friendly competition!
        </p>
      </div>

      <div className="lead-container">
        <div className="lead-right">
          <div className="lead-search">
            <form>
              <input
                type="text"
                placeholder="Search Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="leaderboard-searchbar"
              />
              <input
                type="text"
                placeholder="Search Test Name"
                value={testname}
                onChange={(e) => setTestname(e.target.value)}
                className="leaderboard-searchbar"
              />
              <input
                type="text"
                placeholder="Search Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="leaderboard-searchbar"
              />
              <input
                type="text"
                placeholder="Search Score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="leaderboard-searchbar"
              />
            </form>
          </div>

          <div className="lead-download">
            <button onClick={downloadPDF} className="download-button">
              Download as PDF
            </button>
          </div>

          <div className="sorting-options">
            <h3>Sort By:</h3>
            <div>
              <input
                type="radio"
                id="score"
                name="sortCriteria"
                value="score"
                checked={sortCriteria === "score"}
                onChange={handleSortCriteriaChange}
              />
              <label htmlFor="score">Score</label>
            </div>
            <div>
              <input
                type="radio"
                id="time"
                name="sortCriteria"
                value="total_time"
                checked={sortCriteria === "total_time"}
                onChange={handleSortCriteriaChange}
              />
              <label htmlFor="time">Time</label>
            </div>
            <h3>Order:</h3>
            <div>
              <input
                type="radio"
                id="asc"
                name="sortDirection"
                value="asc"
                checked={sortDirection === "asc"}
                onChange={handleSortDirectionChange}
              />
              <label htmlFor="asc">Ascending</label>
            </div>
            <div>
              <input
                type="radio"
                id="desc"
                name="sortDirection"
                value="desc"
                checked={sortDirection === "desc"}
                onChange={handleSortDirectionChange}
              />
              <label htmlFor="desc">Descending</label>
            </div>
          </div>

          <div className="leaderboard-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Test Name</th>
                  <th>Department</th>
                  <th>year</th>
                  <th>Total Score</th>
                  <th>Student Score</th>
                  <th>Total Time</th>
                  <th>Student Time</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.user_id}</td>
                    <td>{item.test_name}</td>
                    <td>{item.department}</td>
                    <td>{item.year}</td>
                    <td>{item.total_score}</td>
                    <td>{item.score}</td>
                    <td>{item.total_time}</td>
                    <td>{item.complete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
