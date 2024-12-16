import React, { useState } from "react";
import axios from "axios";

const GateQuesFormat = () => {
  const [dept, setDept] = useState("");
  const [coreQuestions, setCoreQuestions] = useState([]);
  const [aptQuestions, setAptQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (department) => {
    setDept(department);
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/standardFormat/${department}`
      );
      setCoreQuestions(response.data.corequestions);
      setAptQuestions(response.data.aptquestions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data, title) => (
    <div className="table-responsive">
      <h3>{title}</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Type</th>
            <th>Options</th>
            <th>Answer</th>
            <th>Mark</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.question}</td>
              <td>{item.type}</td>
              <td>{item.options && item.options.join(", ")}</td>
              <td>{item.answer && item.answer.join(", ")}</td>
              <td>{item.mark}</td>
              <td>
                {item.img_url ? (
                  <img src={item.img_url} alt="img" style={{ width: "50px" }} />
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <button
          className="btn btn-primary mx-2"
          onClick={() => handleButtonClick("cse")}
        >
          CSE
        </button>
        <button
          className="btn btn-primary mx-2"
          onClick={() => handleButtonClick("ee")}
        >
          EE
        </button>
        <button
          className="btn btn-primary mx-2"
          onClick={() => handleButtonClick("me")}
        >
          ME
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div>
          {dept && (
            <>
              <h2 className="text-center mb-4">
                Questions for {dept.toUpperCase()}
              </h2>
              {coreQuestions.length > 0 &&
                renderTable(coreQuestions, "Core Questions")}
              {aptQuestions.length > 0 &&
                renderTable(aptQuestions, "Aptitude Questions")}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GateQuesFormat;
