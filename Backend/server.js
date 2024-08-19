const express=require("express")
const mysql2=require("mysql2")
const cors=require("cors")
const CryptoJS=require("crypto-js")
const mysqlPromise = require('mysql2/promise'); 

const app = express()
app.use(cors())
app.use(express.json())

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
app.post("/register/",(req,res)=>{
   const {name,email,dept,year,registerno,password,role}=req.body
    const hp = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
    
    pool.query("Select * from user where email=?",[email],(err,result)=>{
        if(err){
            console.log(err)
        }
        else if(result.length>0){
            res.send("exists")
        }
        else{
            pool.query("insert into user(name,email,dept,year,registerno,password,role) values(?,?,?,?,?,?,?)",[name,email,dept,year,registerno,hp,role],(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.send("ok")
                }
            })
        }
    })
})
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
          if(result[0].role==="admin"){
            res.send("admin")
          }
          else{
            res.send(result)
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
  console.log(comp,tech,apt,verb)
  let techQuery;
  let aptQuery;
  let verbQuery;
  let paramstech;
  let paramsapt;
  let paramsverb;
  
  if (comp === 'all') {
      techQuery = "SELECT * FROM technical_questions ORDER BY RAND() LIMIT ?";
      aptQuery = "SELECT * FROM aptitude_questions ORDER BY RAND() LIMIT ?";
      verbQuery = "SELECT * FROM verbal_questions ORDER BY RAND() LIMIT ?";
      paramstech = [tech];
      paramsapt = [apt];
      paramsverb = [verb];
  } else {

      techQuery = "SELECT * FROM technical_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      aptQuery = "SELECT * FROM aptitude_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      verbQuery = "SELECT * FROM verbal_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      paramstech = [comp, tech];
      paramsapt = [comp, apt];
      paramsverb = [comp, verb];
  }

  try {
      const [h] = await promisePool.query(techQuery, paramstech);
      const [m] = await promisePool.query(aptQuery, paramsapt);
      const [e] = await promisePool.query(verbQuery, paramsverb);

      res.json({
          "tech": h,
          "apt": m,
          "verb": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/questions/company/",(req,res)=>{

  pool.query(`select distinct company from technical_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/lang/",(req,res)=>{

  pool.query(`select distinct topic from technical_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/aptt/",(req,res)=>{

  pool.query(`select distinct topic from aptitude_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/aptc/",(req,res)=>{

  pool.query(`select distinct company from aptitude_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.post("/questions/techm/",async(req,res)=>{
  const{pro,comp,mcq,msq,fill}=req.body
  console.log(pro, comp, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;
  
  if (comp === 'all' && pro=="all") {
      mcqQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      msqQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      fillQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      paramsmcq = ["Multiple Select",mcq];
      paramsmsq = ["Multiple Choice",msq];
      paramsfill = ["Fill Up",fill];
  } else if(comp=="all"){
    mcqQuery = "SELECT * FROM technical_questions WHERE topic=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM technical_questions WHERE topic=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM technical_questions WHERE topic=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select",mcq];
    paramsmsq = [pro,"Multiple Choice", msq];
    paramsfill = [pro,"Fill Up", fill];
}else if(pro=="all"){
  mcqQuery = "SELECT * FROM technical_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
  msqQuery = "SELECT * FROM technical_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
  fillQuery = "SELECT * FROM technical_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
  paramsmcq = [comp, "Multiple Select",mcq];
  paramsmsq = [comp,"Multiple Choice", msq];
  paramsfill = [comp,"Fill Up", fill];
}
  else{
    mcqQuery = "SELECT * FROM technical_questions WHERE topic=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM technical_questions WHERE topic=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM technical_questions WHERE topic=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select",comp,mcq];
    paramsmsq = [pro,"Multiple Choice",comp, msq];
    paramsfill = [pro,"Fill Up",comp, fill];
}

  try {
      const [h] = await promisePool.query(mcqQuery, paramsmcq);
      const [m] = await promisePool.query(msqQuery, paramsmsq);
      const [e] = await promisePool.query(fillQuery, paramsfill);

      res.json({
          "mcq": h,
          "msq": m,
          "fill": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
})
app.post("/questions/aptm/",async(req,res)=>{
  const{comp,top,mcq,msq,fill}=req.body
  console.log(comp, top, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;
  
  if (comp === 'all' && top=="all") {
      mcqQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      msqQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      fillQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      paramsmcq = ["Multiple Select",mcq];
      paramsmsq = ["Multiple Choice",msq];
      paramsfill = ["Fill Up",fill];
  } else if(comp=="all"){
    mcqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select",mcq];
    paramsmsq = [top,"Multiple Choice", msq];
    paramsfill = [top,"Fill Up", fill];
}else if(top=="all"){
  mcqQuery = "SELECT * FROM aptitude_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
  msqQuery = "SELECT * FROM aptitude_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
  fillQuery = "SELECT * FROM aptitude_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
  paramsmcq = [comp, "Multiple Select",mcq];
  paramsmsq = [comp,"Multiple Choice", msq];
  paramsfill = [comp,"Fill Up", fill];
}
  else{
    mcqQuery = "SELECT * FROM aptitude_questions WHERE topic=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM aptitude_questions WHERE topic=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select",comp,mcq];
    paramsmsq = [top,"Multiple Choice",comp, msq];
    paramsfill = [top,"Fill Up",comp, fill];
}

  try {
      const [h] = await promisePool.query(mcqQuery, paramsmcq);
      const [m] = await promisePool.query(msqQuery, paramsmsq);
      const [e] = await promisePool.query(fillQuery, paramsfill);

      res.json({
          "mcq": h,
          "msq": m,
          "fill": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
})
//test schedule
// app.post("/test/schedule", (req, res) => {
//   const { testid, tech, apt, verb, testname, start, end, duration, dept, year, total } = req.body;

//   pool.query("select * from test_table where test_id=?", testid, (err4, result5) => {
//       if (err4) {
//           console.log(err4);
//       } else if (result5.length > 0) {
//           res.send("exist");
//       } else {
//           pool.query("INSERT INTO test_table(test_id, test_name, tech_q, apt_q, verb_q, duration, start_t, end_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [testid, testname, JSON.stringify(tech), JSON.stringify(apt), JSON.stringify(verb), duration, start, end], (err, result) => {
//               if (err) {
//                   console.log(err);
//                   res.send("entering err");
//               } else {
//                   pool.query("SELECT email,registerno,dept FROM user where role='student' and dept=? and year=?",[dept,year], (err, users) => {
//                       if (err) {
//                           console.log(err);
//                           res.send("error fetching users");
//                       } else {
//                           const usersArray = users.map(user => [user.registerno,user.email,user.dept, testid, testname, false, 0, total]); // Prepare data for bulk insert
//                           pool.query("INSERT INTO test_activity(user_id, email,department, test_id, test_name, status, score, total_score) VALUES ?", [usersArray], (err, result) => {
//                               if (err) {
//                                   console.log(err);
//                                   res.send("error adding rows to test_activity");
//                               } else {
//                                   res.send("ok");
//                               }
//                           });
//                       }
//                   });
//               }
//           });
//       }
//   });
// });
app.post("/test/schedule", (req, res) => {
  const { testid, tech, apt, verb, testname, start, end, duration, dept, year, total } = req.body;
console.log(dept)
console.log(total)
  pool.query("select * from test_table where test_id=?", testid, (err4, result5) => {
      if (err4) {
          console.log(err4);
      } else if (result5.length > 0) {
          res.send("exist");
      } else {
          pool.query("INSERT INTO test_table(test_id, test_name, tech_q, apt_q, verb_q, duration, start_t, end_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
            [testid, testname, JSON.stringify(tech), JSON.stringify(apt), JSON.stringify(verb), duration, start, end], (err, result) => {
              if (err) {
                  console.log(err);
                  res.send("entering err");
              } else {
                  const deptPlaceholders = dept.map(() => '?').join(',');
                  const yearPlaceholders = year.map(() => '?').join(',');

                  const query = `SELECT email, registerno, year, dept FROM user WHERE role='student' AND dept IN (${deptPlaceholders}) AND year IN (${yearPlaceholders})`;
                  const queryParams = [...dept, ...year];

                  pool.query(query, queryParams, (err, users) => {
                      if (err) {
                          console.log(err);
                          res.send("error fetching users");
                      } else {
                        console.log(users)
                          const usersArray = users.map(user => [user.registerno, user.email, user.dept, testid, testname, 0, 0, total,duration,user.year]); // Prepare data for bulk insert
                          console.log(usersArray)
                          pool.query("INSERT INTO test_activity(user_id, email, department, test_id, test_name, status, score, total_score,total_time,year) VALUES ?", [usersArray], (err, result) => {
                              if (err) {
                                  console.log(err);
                                  res.send("error adding rows to test_activity");
                              } else {
                                  res.send("ok");
                              }
                          });
                      }
                  });
              }
          });
      }
  });
});

//get test
app.get("/get_test/:email", (req, res) => {
  const email = req.params.email;
// console.log(email)
  pool.query("SELECT test_id FROM test_activity WHERE email=? AND status=0", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (result.length < 1) {
      // console.log(result)
      res.send("No test scheduled");
    } else {
      const testIds = result.map(row => row.test_id);
      
      pool.query("SELECT test_id,test_name,duration,start_t,end_t FROM test_table WHERE test_id IN (?)", [testIds], (err, testDetails) => {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
          return;
        }
        
        res.send(testDetails);
      });
    }
  });
});
//get questions 
app.get("/get_question/:id", (req, res) => {
  const id = req.params.id;

  // Query to fetch test details including question IDs, test_name, and duration
  pool.query(
    "SELECT tech_q, apt_q, verb_q, test_name, duration FROM test_table WHERE test_id=?",
    id,
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        if (result.length === 0) {
          res.status(404).send("Test not found");
          return;
        }

        const { tech_q, apt_q, verb_q, test_name, duration } = result[0];

        // Function to fetch questions from a specific table based on IDs
        const fetchQuestions = (table, ids) => {
          // Skip fetching if IDs list is empty
          if (ids.length === 0) {
            return Promise.resolve([]);
          }

          return new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM ${table} WHERE id IN (?)`, [ids], (err, questions) => {
              if (err) {
                reject(err);
              } else {
                resolve(questions);
              }
            });
          });
        };

        // Fetch questions from all three tables concurrently
        Promise.all([
          fetchQuestions('technical_questions', tech_q),
          fetchQuestions('aptitude_questions', apt_q),
          fetchQuestions('verbal_questions', verb_q)
        ])
          .then(([techQuestions, aptQuestions, verbQuestions]) => {
            // Combine all questions into a single array
            const allQuestions = [...techQuestions, ...aptQuestions, ...verbQuestions];

            // Respond with the test details and questions
            res.json({
              test_name,
              duration,
              questions: allQuestions
            });
          })
          .catch(error => {
            console.error(error);
            res.status(500).send("Internal Server Error");
          });
      }
    }
  );
});

app.get("/get-test-details/:id",(req,res)=>{
  const id = req.params.id;
  pool.query("select * from test_table where test_id=?",[id],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.send(result[0].duration)
    }
  })
})
//adding score
app.post("/addscore/:id/:id2", (req, res) => {
  const id1 = req.params.id;
  const id2=req.params.id2
  const { status, score, complete } = req.body;
  console.log(id2)
  // console.log(req.body)
  // Use parameterized queries to prevent SQL injection
  pool.query('UPDATE test_activity SET status = ?, score = ?, complete=? WHERE email = ? AND test_id = ?  ', [status,score,complete,id2, id1], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      // Use parameterized queries for the second update as well
        res.send("done")
    }
  });
});
//test checking
app.get("/check/:test/:user",(req,res)=>{
  const{test,user}=req.params
  // console.log(test,user)
  pool.query("select status from test_activity where email=? and test_id=?",[user,test],(err,result)=>{
    if(err){
      console.log(err)
    }
    else if(result[0].status==1){
      res.send("done")
    }
    else{
      res.send("not done")
    }
  })
})
//leaderboard
app.get("/leaderboard/",(req,res)=>{
  pool.query("select * from test_activity",(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.json(result)
    }
  })
})

app.get("/userp/:email",(req,res)=>{
  const email = req.params.email;
  pool.query("select test_name, score, test_id, complete, total_time,total_score from test_activity where email=? and status=1",[email],(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result)
    }
  })
})
//user details
app.get("/ud/:email",(req,res)=>{
  const email=req.params.email
  pool.query("select name,email,dept,year,registerno,role from user where email=?",[email],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.send(result)
    }
  })
})
app.get("/testl/:id",(req,res)=>{
  const id=req.params.id;
  pool.query("select * from test_activity where test_id=?",[id],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.send(result)
    }
    })
})
app.get("/stats/",(req,res)=>{
  pool.query("SELECT dept, COUNT(*) AS user_count FROM user WHERE dept IN ('CSE', 'IT', 'AIDS', 'CIVIL', 'MECH', 'EEE','ECE', 'BME', 'CSBS') GROUP BY dept",(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.send(result)
    }
  })
})
app.get("/stats/:id",(req,res)=>{
  const id=req.params.id;
  pool.query("SELECT department, AVG(score) AS average_score FROM test_activity WHERE test_id = ? GROUP BY department ORDER BY department ",[id],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.send(result)
    }
  })
})
app.get("/cq/", (req, res) => {
  let apt, tech, ver;

  // Execute all queries concurrently using Promise.all
  Promise.all([
    promisePool.query("select * from aptitude_questions"),
    promisePool.query("select * from verbal_questions"),
    promisePool.query("select * from technical_questions")
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


app.listen(5000,(req,res)=>{
    console.log("connected")
})

app.get("/getd/",async (req,res)=>{
  try{
  const response=await promisePool.query("select distinct dept from user");
  const response2=await promisePool.query("select distinct year from user");
  res.json({
    "year":response2[0],
    "dept":response[0]
  })
  }
  catch(err){
    console.log(err);
    res.send(err);
  }
})