import React, { useState, useEffect } from "react";
import axios from "axios";



const GateQuestions = () => {
  const [gateQuestions, setGateQuestions] = useState([]);

  const [format, setFormat] = useState({
    "Data Structures and Algorithms": {
      mcq: [0, 0],
      msq: [0, 0],
      fillup: [0, 0],
    },
    "Programming Languages": { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
    "Computer Architecture": { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
    "Operating Systems": { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
    "Database Systems": { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
  });

  const [response, setResponse] = useState(null);

  const [aptMathFormat, setAptMathFormat] = useState({
    aptitude: { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
    mathematics: { mcq: [0, 0], msq: [0, 0], fillup: [0, 0] },
  });

  const [aptMathResponse, setAptMathResponse] = useState(null);
  
  const [totalCoreMarks, setTotalCoreMarks] = useState(0);
  const [totalAptitudeMarks, setTotalAptitudeMarks] = useState(0);
  const [totalMathematicsMarks, setTotalMathematicsMarks] = useState(0);

  const [testDetails, setTestDetails] = useState({
    testName: "",
    dept: "",
    startDate: "",
    endDate: "",
    duration: "",
    totalMarks: 0,
  });


  useEffect(() => {
    setTotalCoreMarks(calculateCoreMarks(response));
    setTotalAptitudeMarks(calculateAptitudeMarks(aptMathResponse));
    setTotalMathematicsMarks(calculateMathematicsMarks(aptMathResponse));
  }, [response, aptMathResponse]);

  const calculateCoreMarks = (response) => {
    if (!response || typeof response !== "object") return 0;
    let totalMarks = 0;
    Object.keys(response).forEach((subject) => {
      ["mcq", "msq", "fillup"].forEach((type) => {
        if (response[subject][type]) {
          response[subject][type].forEach((questionsArray) => {
            questionsArray.forEach((question) => {
              totalMarks += question?.mark || 0;
            });
          });
        }
      });
    });
    return totalMarks;
  };

  const calculateAptitudeMarks = (aptMathResponse) => {
    if (!aptMathResponse || typeof aptMathResponse !== "object") return 0;
    let totalMarks = 0;
    if (aptMathResponse.aptitude?.mcq) {
      aptMathResponse.aptitude.mcq.forEach((questionsArray) => {
        questionsArray.forEach((question) => {
          totalMarks += question?.mark || 0;
        });
      });
    }
    return totalMarks;
  };

  const calculateMathematicsMarks = (aptMathResponse) => {
    if (!aptMathResponse || typeof aptMathResponse !== "object") return 0;
    let totalMarks = 0;
    if (aptMathResponse.mathematics?.mcq) {
      aptMathResponse.mathematics.mcq.forEach((questionsArray) => {
        questionsArray.forEach((question) => {
          totalMarks += question?.mark || 0;
        });
      });
    }
    return totalMarks;
  };

  const fetchAptMathQuestions = async () => {
    try {
      const aptRes = await axios.post("http://localhost:5000/getAptQuestions", {
        format: aptMathFormat.aptitude,
      });

      const mathRes = await axios.post(
        "http://localhost:5000/getMathQuestions",
        {
          format: aptMathFormat.mathematics,
        }
      );

      setAptMathResponse({
        aptitude: aptRes.data,
        mathematics: mathRes.data,
      });
      // console.log(JSON.stringify(aptMathResponse));
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  const handleAptMathChange = (subject, type, index, value) => {
    setAptMathFormat((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [type]: prev[subject][type].map((v, i) =>
          i === index ? Number(value) : v
        ),
      },
    }));
  };

  const handleChange = (topic, type, index, value) => {
    setFormat((prev) => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        [type]: prev[topic][type].map((v, i) =>
          i === index ? Number(value) : v
        ),
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/getGateQuestions", {
        format,
      });
      setResponse(res.data);
      // console.log(JSON.stringify(res.data));
      fetchAptMathQuestions();
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  useEffect(() => {
    const extractExamQuestions = () => {
      const examQuestions = {
        core: [],
        math: [],
        apt: [],
      };

      // // Extract core questions if present
      // if (response && typeof response === "object") {
      //   Object.values(response).forEach((subject) => {
      //     ["mcq", "msq", "fillup"].forEach((type) => {
      //       if (subject[type] && Array.isArray(subject[type])) {
      //         const nonEmptyQuestions = subject[type].filter(
      //           (q) => q.length > 0
      //         );
      //         examQuestions.core.push(...nonEmptyQuestions);
      //       }
      //     });
      //   });
      // }

      // Extract core questions if present
      if (response && typeof response === "object") {
        Object.values(response).forEach((subject) => {
          ["mcq", "msq", "fillup"].forEach((type) => {
            if (subject[type] && Array.isArray(subject[type])) {
              const nonEmptyQuestions = subject[type].filter(
                (q) => q.length > 0
              );
              nonEmptyQuestions.forEach((question) => {
                examQuestions.core.push(...question); // Push individual questions directly
              });
            }
          });
        });
      }

      // Extract math questions if present
      if (aptMathResponse?.mathematics) {
        ["mcq", "msq", "fillup"].forEach((type) => {
          if (Array.isArray(aptMathResponse.mathematics[type])) {
            aptMathResponse.mathematics[type].forEach((questions) => {
              if (questions.length > 0) {
                examQuestions.math.push(...questions);
              }
            });
          }
        });
      }

      // Extract aptitude questions if present
      if (aptMathResponse?.aptitude) {
        ["mcq", "msq", "fillup"].forEach((type) => {
          if (Array.isArray(aptMathResponse.aptitude[type])) {
            aptMathResponse.aptitude[type].forEach((questions) => {
              if (questions.length > 0) {
                examQuestions.apt.push(...questions);
              }
            });
          }
        });
      }

      // Log the result as JSON, excluding empty arrays
      console.log(JSON.stringify(examQuestions));
      setGateQuestions(examQuestions);
    };

    extractExamQuestions();
  }, [response, aptMathResponse]); 

  const checkoutExam = () => {
    testDetails.totalMarks =
      totalCoreMarks + totalAptitudeMarks + totalMathematicsMarks;
    const examDetails = {
      details: testDetails,
      questions: gateQuestions,
    };
    console.log(JSON.stringify(examDetails));
    axios
      .post("http://localhost:5000/scheduleGateTest", examDetails )
      .then((response) => {
        alert(response.data); // Alert the user with the response
      })
      .catch((error) => {
        console.error("Error scheduling test:", error);
        alert("Failed to schedule test. Please try again.");
      });
  };

  return (
    <div className="container mt-5">
      <button
        className="btn btn-primary"
        onClick={checkoutExam}
      >
        Schedule Test
      </button>
      <h1>Gate Questions Fetcher</h1>

      <div className="container mt-5">
        <h1>Test Details</h1>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Test Name</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              value={testDetails.testName}
              onChange={(e) =>
                setTestDetails((prev) => ({
                  ...prev,
                  testName: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Department</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              value={testDetails.dept}
              onChange={(e) =>
                setTestDetails((prev) => ({ ...prev, dept: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Start Date and Time</label>
          <div className="col-sm-10">
            <input
              type="datetime-local"
              className="form-control"
              value={testDetails.startDate}
              onChange={(e) =>
                setTestDetails((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">End Date and Time</label>
          <div className="col-sm-10">
            <input
              type="datetime-local"
              className="form-control"
              value={testDetails.endDate}
              onChange={(e) =>
                setTestDetails((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Duration (hours)</label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              value={testDetails.duration}
              onChange={(e) =>
                setTestDetails((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div>
        <div>
          <h2>Aptitude</h2>
          {["mcq", "msq", "fillup"].map((type) => (
            <div key={type} className="row mb-2">
              <label className="col-sm-2 col-form-label">
                {type.toUpperCase()}
              </label>
              <div className="col-sm-5">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="1 Mark"
                  value={aptMathFormat.aptitude[type][0]}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) =>
                    handleAptMathChange("aptitude", type, 0, e.target.value)
                  }
                />
              </div>
              <div className="col-sm-5">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="2 Mark"
                  onWheel={(e) => e.target.blur()}
                  value={aptMathFormat.aptitude[type][1]}
                  onChange={(e) =>
                    handleAptMathChange("aptitude", type, 1, e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <br />
          <h2>Mathematics</h2>
          {["mcq", "msq", "fillup"].map((type) => (
            <div key={type} className="row mb-2">
              <label className="col-sm-2 col-form-label">
                {type.toUpperCase()}
              </label>
              <div className="col-sm-5">
                <input
                  type="number"
                  className="form-control"
                  placeholder="1 Mark"
                  onWheel={(e) => e.target.blur()}
                  value={aptMathFormat.mathematics[type][0]}
                  onChange={(e) =>
                    handleAptMathChange("mathematics", type, 0, e.target.value)
                  }
                />
              </div>
              <div className="col-sm-5">
                <input
                  type="number"
                  className="form-control"
                  placeholder="2 Mark"
                  onWheel={(e) => e.target.blur()}
                  value={aptMathFormat.mathematics[type][1]}
                  onChange={(e) =>
                    handleAptMathChange("mathematics", type, 1, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <br />
        <h2>Core Subjects</h2>
        {Object.keys(format).map((topic) => (
          <div key={topic} className="mb-4">
            <h3>{topic}</h3>
            {["mcq", "msq", "fillup"].map((type) => (
              <div key={type} className="row mb-2">
                <label className="col-sm-2 col-form-label">
                  {type.toUpperCase()}
                </label>
                <div className="col-sm-5">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="1 Mark"
                    onWheel={(e) => e.target.blur()}
                    value={format[topic][type][0]}
                    onChange={(e) =>
                      handleChange(topic, type, 0, e.target.value)
                    }
                  />
                </div>
                <div className="col-sm-5">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="2 Mark"
                    onWheel={(e) => e.target.blur()}
                    value={format[topic][type][1]}
                    onChange={(e) =>
                      handleChange(topic, type, 1, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSubmit}>
          Fetch Questions
        </button>
      </div>

      <div>
        <h3>Marks Distribution</h3>
        <p>Core Marks: {totalCoreMarks}</p>
        <p>Aptitude Marks: {totalAptitudeMarks}</p>
        <p>Mathematics Marks: {totalMathematicsMarks}</p>
        <p>
          Total Marks:{" "}
          {totalCoreMarks + totalAptitudeMarks + totalMathematicsMarks}
        </p>
      </div>

      {aptMathResponse && (
        <div className="mt-5">
          <h2>Aptitude Questions</h2>

          {["mcq", "msq", "fillup"].map((type) => (
            <div key={type}>
              {aptMathResponse.aptitude[type] &&
                aptMathResponse.aptitude[type][0] &&
                aptMathResponse.aptitude[type][0].length > 0 && (
                  <div>
                    <h4>{type.toUpperCase()}</h4>
                    {aptMathResponse.aptitude[type].map((questions, index) => {
                      if (questions.length === 0) return null;
                      return (
                        <div key={index}>
                          <h5>{index === 0 ? "1 Mark" : "2 Mark"}</h5>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Answer</th>
                                <th>Topic</th>
                                <th>Mark</th>
                                <th>Image URL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {questions.map((q) => (
                                <tr key={q.id}>
                                  <td>{q.id}</td>
                                  <td>{q.question}</td>
                                  <td>{q.type}</td>
                                  <td>{q.answer.join(", ")}</td>
                                  <td>{q.topic}</td>
                                  <td>{q.mark}</td>
                                  <td>{q.img_url || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          ))}

          {/* Mathematics Questions */}
          <h2>Mathematics Questions</h2>

          {["mcq", "msq", "fillup"].map((type) => (
            <div key={type}>
              {aptMathResponse.mathematics[type] &&
                aptMathResponse.mathematics[type][0] &&
                aptMathResponse.mathematics[type][0].length > 0 && (
                  <div>
                    <h4>{type.toUpperCase()}</h4>
                    {aptMathResponse.mathematics[type].map(
                      (questions, index) => {
                        if (questions.length === 0) return null;
                        return (
                          <div key={index}>
                            <h5>{index === 0 ? "1 Mark" : "2 Mark"}</h5>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Question</th>
                                  <th>Type</th>
                                  <th>Answer</th>
                                  <th>Topic</th>
                                  <th>Mark</th>
                                  <th>Image URL</th>
                                </tr>
                              </thead>
                              <tbody>
                                {questions.map((q) => (
                                  <tr key={q.id}>
                                    <td>{q.id}</td>
                                    <td>{q.question}</td>
                                    <td>{q.type}</td>
                                    <td>{q.answer.join(", ")}</td>
                                    <td>{q.topic}</td>
                                    <td>{q.mark}</td>
                                    <td>{q.img_url || "N/A"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {response && (
        <div className="mt-0">
          <h2 className="fw-bold fw-italic">Core Subjects</h2>
          {Object.keys(response).map((topic) => {
            const topicData = response[topic];
            const hasQuestions = Object.values(topicData).some(
              (typeData) => typeData.flat().length > 0
            );
            if (!hasQuestions) return null;

            return (
              <div key={topic}>
                <h3>{topic}</h3>
                {Object.keys(topicData).map((type) => {
                  const typeData = topicData[type];
                  const hasTypeQuestions = typeData.flat().length > 0;
                  if (!hasTypeQuestions) return null;

                  return (
                    <div key={type} className="mb-4">
                      <h5>{type.toUpperCase()}</h5>
                      {typeData.map((questions, index) => {
                        if (questions.length === 0) return null;

                        return (
                          <div key={index}>
                            <h6>{index === 0 ? "1 Mark" : "2 Mark"}</h6>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Question</th>
                                  <th>Type</th>
                                  <th>Answer</th>
                                  <th>Topic</th>
                                  <th>Mark</th>
                                  <th>Image URL</th>
                                </tr>
                              </thead>
                              <tbody>
                                {questions.map((q) => (
                                  <tr key={q.id}>
                                    <td>{q.id}</td>
                                    <td>{q.question}</td>
                                    <td>{q.type}</td>
                                    <td>{q.answer.join(", ")}</td>
                                    <td>{q.topic}</td>
                                    <td>{q.mark}</td>
                                    <td>{q.img_url || "N/A"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GateQuestions;

