const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const mysqlPromise = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "1080", // Replace with your local MySQL password
  database: "technex", // Replace with your local database name
  port: 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = mysqlPromise.createPool({
  host: "localhost",
  user: "root",
  password: "1080", // Replace with your local MySQL password
  database: "technex", // Replace with your local database name
  port: 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// const pool=mysql2.createPool("mysql://root:JKUsPQzPRLEoURHkDoLvetuRPjKtaIVq@monorail.proxy.rlwy.net:23238/railway")

// const promisePool = mysqlPromise.createPool({
//     connectionLimit: 10,
//     host: 'monorail.proxy.rlwy.net',
//     user: 'root',
//     password: 'JKUsPQzPRLEoURHkDoLvetuRPjKtaIVq',
//     port: 23238,
//     database: 'railway',
//     waitForConnections: true,
//     queueLimit: 0
// });

app.post("/api/tech_questions", (req, res) => {
  const {
    question,
    options,
    type,
    topic,
    difficulty,
    company,
    answer,
    image_url,
  } = req.body;

  pool.query(
    "INSERT INTO technical_questions (question, options, type, topic, difficulty, company, answer, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      question,
      JSON.stringify(options),
      type,
      topic,
      difficulty,
      company,
      JSON.stringify(answer),
      image_url, // Use image_url instead of raw image data
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting question into database:", err);
        res
          .status(500)
          .send({ success: false, message: "Error saving the question" });
      } else {
        console.log("Question saved successfully");
        res.send({ success: true, message: "Question saved successfully" });
      }
    }
  );
});

app.get("/get_technical_questions", (req, res) => {
  pool.query(
    "select id, question,options, type, topic, difficulty, company, answer from technical_questions",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/get_aptitude_questions", (req, res) => {
  pool.query(
    "select id, question,options, type, topic, difficulty, company, answer from aptitude_questions",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/get_verbal_questions", (req, res) => {
  pool.query(
    "select id, question,options, type, topic, difficulty, company, answer from verbal_questions",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// user content
app.post("/register/", (req, res) => {
  const { name, email, dept, year, registerno, password, role } = req.body;
  const hp = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);

  pool.query("Select * from user where email=?", [email], (err, result) => {
    if (err) {
      console.log(err);
    } else if (result.length > 0) {
      res.send("exists");
    } else {
      pool.query(
        "insert into user(name,email,dept,year,registerno,password,role) values(?,?,?,?,?,?,?)",
        [name, email, dept, year, registerno, hp, role],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.send("ok");
          }
        }
      );
    }
  });
});
app.post("/login/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  pool.query("Select * from user where email=?", email, (err, result) => {
    if (err) {
      console.log(err);
    } else if (result.length < 1) {
      res.send("NOT exists");
    } else {
      const sp = result[0].password;
      const hp = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
      if (sp == hp) {
        if (result[0].role === "admin") {
          res.send("admin");
        } else {
          res.send(result);
        }
      } else {
        res.send("no match");
      }
    }
  });
});
//test assigning
app.post("/questions/spec/tech/", async (req, res) => {
  const { comp, tech, apt, verb } = req.body;
  console.log(comp, tech, apt, verb);
  let techQuery;
  let aptQuery;
  let verbQuery;
  let paramstech;
  let paramsapt;
  let paramsverb;

  if (comp === "all") {
    techQuery = "SELECT * FROM technical_questions ORDER BY RAND() LIMIT ?";
    aptQuery = "SELECT * FROM aptitude_questions ORDER BY RAND() LIMIT ?";
    verbQuery = "SELECT * FROM verbal_questions ORDER BY RAND() LIMIT ?";
    paramstech = [tech];
    paramsapt = [apt];
    paramsverb = [verb];
  } else {
    techQuery =
      "SELECT * FROM technical_questions WHERE company=? ORDER BY RAND() LIMIT ?";
    aptQuery =
      "SELECT * FROM aptitude_questions WHERE company=? ORDER BY RAND() LIMIT ?";
    verbQuery =
      "SELECT * FROM verbal_questions WHERE company=? ORDER BY RAND() LIMIT ?";
    paramstech = [comp, tech];
    paramsapt = [comp, apt];
    paramsverb = [comp, verb];
  }

  try {
    const [h] = await promisePool.query(techQuery, paramstech);
    const [m] = await promisePool.query(aptQuery, paramsapt);
    const [e] = await promisePool.query(verbQuery, paramsverb);

    res.json({
      tech: h,
      apt: m,
      verb: e,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/questions/company/", (req, res) => {
  pool.query(
    `select distinct company from technical_questions `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
});
app.get("/questions/lang/", (req, res) => {
  pool.query(
    `select distinct topic from technical_questions `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
});
app.get("/questions/aptt/", (req, res) => {
  pool.query(
    `select distinct topic from aptitude_questions `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
});
app.get("/questions/aptc/", (req, res) => {
  pool.query(
    `select distinct company from aptitude_questions `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
});
app.post("/questions/techm/", async (req, res) => {
  const { pro, comp, mcq, msq, fill } = req.body;
  console.log(pro, comp, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;

  if (comp === "all" && pro == "all") {
    mcqQuery =
      "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
    paramsmcq = ["Multiple Select", mcq];
    paramsmsq = ["Multiple Choice", msq];
    paramsfill = ["Fill Up", fill];
  } else if (comp == "all") {
    mcqQuery =
      "SELECT * FROM technical_questions WHERE topic=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM technical_questions WHERE topic=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM technical_questions WHERE topic=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select", mcq];
    paramsmsq = [pro, "Multiple Choice", msq];
    paramsfill = [pro, "Fill Up", fill];
  } else if (pro == "all") {
    mcqQuery =
      "SELECT * FROM technical_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM technical_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM technical_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [comp, "Multiple Select", mcq];
    paramsmsq = [comp, "Multiple Choice", msq];
    paramsfill = [comp, "Fill Up", fill];
  } else {
    mcqQuery =
      "SELECT * FROM technical_questions WHERE topic=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM technical_questions WHERE topic=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM technical_questions WHERE topic=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select", comp, mcq];
    paramsmsq = [pro, "Multiple Choice", comp, msq];
    paramsfill = [pro, "Fill Up", comp, fill];
  }

  try {
    const [h] = await promisePool.query(mcqQuery, paramsmcq);
    const [m] = await promisePool.query(msqQuery, paramsmsq);
    const [e] = await promisePool.query(fillQuery, paramsfill);

    res.json({
      mcq: h,
      msq: m,
      fill: e,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/questions/aptm/", async (req, res) => {
  const { comp, top, mcq, msq, fill } = req.body;
  console.log(comp, top, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;

  if (comp === "all" && top == "all") {
    mcqQuery =
      "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
    paramsmcq = ["Multiple Select", mcq];
    paramsmsq = ["Multiple Choice", msq];
    paramsfill = ["Fill Up", fill];
  } else if (comp == "all") {
    mcqQuery =
      "SELECT * FROM aptitude_questions WHERE topic=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM aptitude_questions WHERE topic=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM aptitude_questions WHERE topic=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select", mcq];
    paramsmsq = [top, "Multiple Choice", msq];
    paramsfill = [top, "Fill Up", fill];
  } else if (top == "all") {
    mcqQuery =
      "SELECT * FROM aptitude_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM aptitude_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM aptitude_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [comp, "Multiple Select", mcq];
    paramsmsq = [comp, "Multiple Choice", msq];
    paramsfill = [comp, "Fill Up", fill];
  } else {
    mcqQuery =
      "SELECT * FROM aptitude_questions WHERE topic=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery =
      "SELECT * FROM aptitude_questions WHERE topic=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery =
      "SELECT * FROM aptitude_questions WHERE topic=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select", comp, mcq];
    paramsmsq = [top, "Multiple Choice", comp, msq];
    paramsfill = [top, "Fill Up", comp, fill];
  }

  try {
    const [h] = await promisePool.query(mcqQuery, paramsmcq);
    const [m] = await promisePool.query(msqQuery, paramsmsq);
    const [e] = await promisePool.query(fillQuery, paramsfill);

    res.json({
      mcq: h,
      msq: m,
      fill: e,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.post("/scheduleGateTest", (req, res) => {
  console.log(req.body)
  const { details, questions } = req.body;

  const { testName, dept, startDate, endDate, duration, totalMarks } = details;
  const core = JSON.stringify(questions.core || []);
  const math = JSON.stringify(questions.math || []);
  const apt = JSON.stringify(questions.apt || []);
  const testId = CryptoJS.lib.WordArray.random(3).toString();

  // Step 1: Start a transaction
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("Error getting connection:", err);
      return res.status(500).send("Error getting connection");
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.log("Error starting transaction:", err);
        connection.release();
        return res.status(500).send("Error starting transaction");
      }

      // Step 2: Check if the test ID already exists
      connection.query(
        "SELECT * FROM gate_test_table WHERE test_id = ?",
        [testId],
        (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.log("Error checking test existence:", err);
              return res.status(500).send("Error checking test existence");
            });
          } else if (result.length > 0) {
            connection.rollback(() => {
              connection.release();
              return res.status(400).send("Test ID collision, please retry");
            });
          } else {
            // Step 3: Insert the test details into gate_test_table
            connection.query(
              "INSERT INTO gate_test_table (test_id, test_name, dept, core, math, apt, duration, start_t, end_t, total_marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                testId,
                testName,
                dept,
                core,
                math,
                apt,
                duration,
                startDate,
                endDate,
                totalMarks
              ],
              (insertErr, insertResult) => {
                if (insertErr) {
                  connection.rollback(() => {
                    connection.release();
                    console.log("Error inserting test details:", insertErr);
                    return res.status(500).send("Error inserting test details");
                  });
                } else {
                  // Step 4: Fetch users eligible for the test
                  connection.query(
                    "SELECT id AS user_id, email FROM user WHERE dept = ? AND role = 'student'",
                    [dept],
                    (userErr, users) => {
                      if (userErr) {
                        connection.rollback(() => {
                          connection.release();
                          console.log("Error fetching users:", userErr);
                          return res.status(500).send("Error fetching users");
                        });
                      } else {
                        // Prepare data for test_activity
                        const testActivityRecords = users.map((user) => [
                          user.user_id,
                          testId,
                          0, // Initial status
                          totalMarks, // Initial total_score
                          testName,
                          dept, // Adding dept
                          user.email, // Adding email
                          0, // Initial complete status
                          duration, // Initial total_time
                          0, // Initial score
                        ]);

                        // Step 5: Insert records into gate_test_activity
                        connection.query(
                          "INSERT INTO gate_test_activity (user_id, test_id, status, total_score, test_name, dept, email, complete, total_time, score) VALUES ?",
                          [testActivityRecords],
                          (activityErr, activityResult) => {
                            if (activityErr) {
                              connection.rollback(() => {
                                connection.release();
                                console.log(
                                  "Error inserting test activity records:",
                                  activityErr
                                );
                                return res
                                  .status(500)
                                  .send(
                                    "Error inserting test activity records"
                                  );
                              });
                            } else {
                              connection.commit((commitErr) => {
                                if (commitErr) {
                                  connection.rollback(() => {
                                    connection.release();
                                    console.log(
                                      "Error committing transaction:",
                                      commitErr
                                    );
                                    return res
                                      .status(500)
                                      .send("Error committing transaction");
                                  });
                                } else {
                                  connection.release();
                                  res.send("Test scheduled successfully");
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  });
});




app.post("/test/schedule", (req, res) => {
  const {
    testid,
    tech,
    apt,
    verb,
    testname,
    start,
    end,
    duration,
    dept,
    year,
    total,
  } = req.body;
  console.log(dept);
  console.log(total);
  pool.query(
    "select * from test_table where test_id=?",
    testid,
    (err4, result5) => {
      if (err4) {
        console.log(err4);
      } else if (result5.length > 0) {
        res.send("exist");
      } else {
        pool.query(
          "INSERT INTO test_table(test_id, test_name, tech_q, apt_q, verb_q, duration, start_t, end_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            testid,
            testname,
            JSON.stringify(tech),
            JSON.stringify(apt),
            JSON.stringify(verb),
            duration,
            start,
            end,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              res.send("entering err");
            } else {
              const deptPlaceholders = dept.map(() => "?").join(",");
              const yearPlaceholders = year.map(() => "?").join(",");

              const query = `SELECT email, registerno, year, dept FROM user WHERE role='student' AND dept IN (${deptPlaceholders}) AND year IN (${yearPlaceholders})`;
              const queryParams = [...dept, ...year];

              pool.query(query, queryParams, (err, users) => {
                if (err) {
                  console.log(err);
                  res.send("error fetching users");
                } else {
                  console.log(users);
                  const usersArray = users.map((user) => [
                    user.registerno,
                    user.email,
                    user.dept,
                    testid,
                    testname,
                    0,
                    0,
                    total,
                    duration,
                    user.year,
                  ]); // Prepare data for bulk insert
                  console.log(usersArray);
                  pool.query(
                    "INSERT INTO test_activity(user_id, email, department, test_id, test_name, status, score, total_score,total_time,year) VALUES ?",
                    [usersArray],
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        res.send("error adding rows to test_activity");
                      } else {
                        res.send("ok");
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    }
  );
});

//get test
app.get("/get_test/:email", (req, res) => {
  const email = req.params.email;
  // console.log(email)
  pool.query(
    "SELECT test_id FROM gate_test_activity WHERE email=? AND status=0",
    [email],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (result.length < 1) {
        res.send("No test scheduled");
        console.log(result)
      } else {
        const testIds = result.map((row) => row.test_id);

        pool.query(
          "SELECT test_id,test_name,duration,start_t,end_t FROM gate_test_table WHERE test_id IN (?)",
          [testIds],
          (err, testDetails) => {
            if (err) {
              console.log(err);
              res.status(500).send("Internal Server Error");
              return;
            }

            res.send(testDetails);
          }
        );
      }
    }
  );
});

app.get("/get_question/:id", (req, res) =>{
    // Query to fetch test details including question IDs, test_name, and duration
    const id = req.params.id
    pool.query(
      "SELECT core, math, apt, test_name, duration FROM gate_test_table WHERE test_id=?",
      id,
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } 
        result = result[0]
        const exam = {
          test_name: result.test_name,
          duration: result.duration,
          questions: [...result.core, ...result.math, ...result.apt]
        }
        res.json(exam)
      }
    )
})

//adding score
app.post("/addscore/:id/:id2", (req, res) => {
  const id1 = req.params.id;
  const id2 = req.params.id2;
  const { status, score, complete } = req.body;
  console.log(id2);
  pool.query(
    "UPDATE gate_test_activity SET status = ?, score = ?, complete=? WHERE email = ? AND test_id = ?  ",
    [status, score, complete, id2, id1],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("done");
      }
    }
  );
});

//test checking
app.get("/check/:test/:user", (req, res) => {
  const { test, user } = req.params;
  // console.log(test,user)
  pool.query(
    "select status from gate_test_activity where email=? and test_id=?",
    [user, test],
    (err, result) => {
      if (err) {
        console.log(err);
      } else if (result[0].status == 1) {
        res.send("done");
      } else {
        res.send("not done");
      }
    }
  );
});

//leaderboard
app.get("/leaderboard/", (req, res) => {
  pool.query("select * from test_activity", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/userp/:email", (req, res) => {
  const email = req.params.email;
  pool.query(
    "select test_name, score, test_id, complete, total_time,total_score from gate_test_activity where email=? and status=1",
    [email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

//user details
app.get("/ud/:email", (req, res) => {
  const email = req.params.email;
  pool.query(
    "select name,email,dept,year,registerno,role from user where email=?",
    [email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});
app.get("/testl/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "select * from test_activity where test_id=?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});
app.get("/stats/", (req, res) => {
  pool.query(
    "SELECT dept, COUNT(*) AS user_count FROM user WHERE dept IN ('CSE', 'IT', 'AIDS', 'CIVIL', 'MECH', 'EEE','ECE', 'BME', 'CSBS') GROUP BY dept",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});
app.get("/stats/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT department, AVG(score) AS average_score FROM test_activity WHERE test_id = ? GROUP BY department ORDER BY department ",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});
app.get("/cq/", (req, res) => {
  let apt, tech, ver;

  // Execute all queries concurrently using Promise.all
  Promise.all([
    promisePool.query("select * from aptitude_questions"),
    promisePool.query("select * from verbal_questions"),
    promisePool.query("select * from technical_questions"),
  ])
    .then((results) => {
      // Extract results from each query
      apt = results[0];
      ver = results[1];
      tech = results[2];

      // Send the response with all results
      res.send({ apt, ver, tech });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err.message);
    });
});





app.get("/standardFormat/:dept", (req, res) => {
  const dept = req.params.dept + " core";

  const queries = {
    oneMarkCore: `
      SELECT * 
      FROM core_questions 
      WHERE topic = ? AND mark = 1 
      ORDER BY RAND() 
      LIMIT 15
    `,
    twoMarkCore: `
      SELECT id, question, type, options, answer, topic, mark, img_url 
      FROM core_questions 
      WHERE topic = ? AND mark = 2 
      ORDER BY RAND() 
      LIMIT 30
    `,
    oneMarkApt: `
      SELECT * 
      FROM apt_gate 
      WHERE mark = 1 
      ORDER BY RAND() 
      LIMIT 10
    `,
    twoMarkApt: `
      SELECT * 
      FROM apt_gate 
      WHERE mark = 2 
      ORDER BY RAND() 
      LIMIT 5
    `,
  };

  // Using Promise.all to fetch all queries in parallel
  Promise.all([
    promisePool.query(queries.oneMarkCore, [dept]),
    promisePool.query(queries.twoMarkCore, [dept]),
    promisePool.query(queries.oneMarkApt),
    promisePool.query(queries.twoMarkApt),
  ])
    .then(
      ([
        resultOneMarkCore,
        resultTwoMarkCore,
        resultOneMarkApt,
        resultTwoMarkApt,
      ]) => {
        // Access the first element of each result to get the rows
        const coreQuestions = [
          ...resultOneMarkCore[0], // resultOneMarkCore[0] contains the data (rows)
          ...resultTwoMarkCore[0], // resultTwoMarkCore[0] contains the data (rows)
        ];
        const aptQuestions = [
          ...resultOneMarkApt[0], // resultOneMarkApt[0] contains the data (rows)
          ...resultTwoMarkApt[0], // resultTwoMarkApt[0] contains the data (rows)
        ];

        // Send the response with both core and aptitude questions
        res.json({
          corequestions: coreQuestions,
          aptquestions: aptQuestions,
        });
      }
    )
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred while fetching questions.");
    });
});


app.post("/getGateQuestions", (req, res) => {
  const format = req.body.format;
  const response = {};
  const promises = [];

  // Iterate through each topic in the format
  Object.keys(format).forEach((topic) => {
    response[topic] = { mcq: [[], []], msq: [[], []], fillup: [[], []] };

    // Fetch MCQ questions
    if (format[topic].mcq && format[topic].mcq.length === 2) {
      const mcqOneMark = format[topic].mcq[0];
      const mcqTwoMark = format[topic].mcq[1];
      if (mcqOneMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'mcq' AND mark = 1 ORDER BY RAND() LIMIT ?",
              [topic, mcqOneMark]
            )
            .then(([results]) => {
              response[topic].mcq[0] = results;
            })
        );
      }
      if (mcqTwoMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'mcq' AND mark = 2 ORDER BY RAND() LIMIT ?",
              [topic, mcqTwoMark]
            )
            .then(([results]) => {
              response[topic].mcq[1] = results;
            })
        );
      }
    }

    // Fetch MSQ questions
    if (format[topic].msq && format[topic].msq.length === 2) {
      const msqOneMark = format[topic].msq[0];
      const msqTwoMark = format[topic].msq[1];
      if (msqOneMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'msq' AND mark = 1 ORDER BY RAND() LIMIT ?",
              [topic, msqOneMark]
            )
            .then(([results]) => {
              response[topic].msq[0] = results;
            })
        );
      }
      if (msqTwoMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'msq' AND mark = 2 ORDER BY RAND() LIMIT ?",
              [topic, msqTwoMark]
            )
            .then(([results]) => {
              response[topic].msq[1] = results;
            })
        );
      }
    }

    // Fetch Fillup questions
    if (format[topic].fillup && format[topic].fillup.length === 2) {
      const fillupOneMark = format[topic].fillup[0];
      const fillupTwoMark = format[topic].fillup[1];
      if (fillupOneMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'fillup' AND mark = 1 ORDER BY RAND() LIMIT ?",
              [topic, fillupOneMark]
            )
            .then(([results]) => {
              response[topic].fillup[0] = results;
            })
        );
      }
      if (fillupTwoMark > 0) {
        promises.push(
          promisePool
            .query(
              "SELECT * FROM core_questions WHERE topic = ? AND type = 'fillup' AND mark = 2 ORDER BY RAND() LIMIT ?",
              [topic, fillupTwoMark]
            )
            .then(([results]) => {
              response[topic].fillup[1] = results;
            })
        );
      }
    }
  });

  // Execute all promises and send the response
  Promise.all(promises)
    .then(() => {
      res.json(response);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching questions");
    });
});
// For Aptitude Questions
app.post("/getAptQuestions", (req, res) => {
  const format = req.body.format;
  const response = { mcq: [[], []], msq: [[], []], fillup: [[], []] };
  const promises = [];

  // Fetch MCQ questions
  if (format.mcq && format.mcq.length === 2) {
    const mcqOneMark = format.mcq[0];
    const mcqTwoMark = format.mcq[1];
    if (mcqOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'mcq' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [mcqOneMark]
          )
          .then(([results]) => {
            response.mcq[0] = results;
          })
      );
    }
    if (mcqTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'mcq' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [mcqTwoMark]
          )
          .then(([results]) => {
            response.mcq[1] = results;
          })
      );
    }
  }

  // Fetch MSQ questions
  if (format.msq && format.msq.length === 2) {
    const msqOneMark = format.msq[0];
    const msqTwoMark = format.msq[1];
    if (msqOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'msq' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [msqOneMark]
          )
          .then(([results]) => {
            response.msq[0] = results;
          })
      );
    }
    if (msqTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'msq' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [msqTwoMark]
          )
          .then(([results]) => {
            response.msq[1] = results;
          })
      );
    }
  }

  // Fetch Fillup questions
  if (format.fillup && format.fillup.length === 2) {
    const fillupOneMark = format.fillup[0];
    const fillupTwoMark = format.fillup[1];
    if (fillupOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'fillup' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [fillupOneMark]
          )
          .then(([results]) => {
            response.fillup[0] = results;
          })
      );
    }
    if (fillupTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM apt_gate WHERE type = 'fillup' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [fillupTwoMark]
          )
          .then(([results]) => {
            response.fillup[1] = results;
          })
      );
    }
  }

  // Execute all promises and send the response
  Promise.all(promises)
    .then(() => {
      res.json(response);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching questions");
    });
});

// For Math Questions
app.post("/getMathQuestions", (req, res) => {
  const format = req.body.format;
  const response = { mcq: [[], []], msq: [[], []], fillup: [[], []] };
  const promises = [];

  // Fetch MCQ questions
  if (format.mcq && format.mcq.length === 2) {
    const mcqOneMark = format.mcq[0];
    const mcqTwoMark = format.mcq[1];
    if (mcqOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'mcq' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [mcqOneMark]
          )
          .then(([results]) => {
            response.mcq[0] = results;
          })
      );
    }
    if (mcqTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'mcq' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [mcqTwoMark]
          )
          .then(([results]) => {
            response.mcq[1] = results;
          })
      );
    }
  }

  // Fetch MSQ questions
  if (format.msq && format.msq.length === 2) {
    const msqOneMark = format.msq[0];
    const msqTwoMark = format.msq[1];
    if (msqOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'msq' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [msqOneMark]
          )
          .then(([results]) => {
            response.msq[0] = results;
          })
      );
    }
    if (msqTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'msq' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [msqTwoMark]
          )
          .then(([results]) => {
            response.msq[1] = results;
          })
      );
    }
  }

  // Fetch Fillup questions
  if (format.fillup && format.fillup.length === 2) {
    const fillupOneMark = format.fillup[0];
    const fillupTwoMark = format.fillup[1];
    if (fillupOneMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'fillup' AND mark = 1 ORDER BY RAND() LIMIT ?",
            [fillupOneMark]
          )
          .then(([results]) => {
            response.fillup[0] = results;
          })
      );
    }
    if (fillupTwoMark > 0) {
      promises.push(
        promisePool
          .query(
            "SELECT * FROM math_questions WHERE type = 'fillup' AND mark = 2 ORDER BY RAND() LIMIT ?",
            [fillupTwoMark]
          )
          .then(([results]) => {
            response.fillup[1] = results;
          })
      );
    }
  }

  // Execute all promises and send the response
  Promise.all(promises)
    .then(() => {
      res.json(response);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching questions");
    });
});



app.listen(5000, (req, res) => {
  console.log("connected");
});

app.get("/getd/", async (req, res) => {
  try {
    const response = await promisePool.query("select distinct dept from user");
    const response2 = await promisePool.query("select distinct year from user");
    res.json({
      year: response2[0],
      dept: response[0],
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
