// import React, { useState } from 'react';
// import Navbar1 from './Navbar1';
// import Choice from '../components1/Choice';
// import Select from '../components1/Select';
// import Fillups from '../components1/Fillups';

// const Uploadquestions = () => {
//     const [selectedOption, setSelectedOption] = useState('');
//     const [savedData, setSavedData] = useState(null);
//     const [file, setFile] = useState(null);

//     const handleChange = (e) => {
//         setSelectedOption(e.target.value);
//     };

//     const handleSave = () => {
//         setSavedData(selectedOption);
//     };

//     const handleSaveAndAddAnother = () => {
//         handleSave();
//         window.location.reload();
//     };

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleUpload = () => {
//         if (file) {
//             // Here you can perform the file upload logic
//             console.log('Uploading file:', file.name);
//             // Clear the file input after upload
//             setFile(null);
//         } else {
//             alert('Please select a file to upload.');
//         }
//     };

//     return (
//         <div>
//             <Navbar1 />
//             <h1 style={{ marginTop: '20px', fontWeight: '500', textAlign: 'center' }}>Hey admins, Upload up your questions</h1>

//             <div className='container'>
//                 <div className='label-container'>
//                     <label className='label' htmlFor="type">
//                         Question type
//                     </label>
//                     <select className='selection-field' name="type" onChange={handleChange} value={selectedOption}>
//                         <option value="">--Question type--</option>
//                         <option value="choice" >Multiple choice</option>
//                         <option value="select">Multiple select</option>
//                         <option value="fill">Fill up's</option>
//                     </select>
//                 </div>
//                 {selectedOption === 'choice' && <Choice />}
//                 {selectedOption === 'select' && <Select />}
//                 {selectedOption === 'fill' && <Fillups />}
//                 <div className='button-container'>
//                     <button className='button1' style={{ marginRight: '20px' }} onClick={handleSave}>Save</button>
//                     <button className='button1' style={{ width: '220px' }} onClick={handleSaveAndAddAnother}>Save & Add Another</button>
//                 </div>
//                 <div style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     overflow: 'hidden',
//                     maxWidth: '800px',
//                     marginLeft: '180px',
//                     marginTop: '50px'
//                 }}>
//                     <hr style={{ flex: 1, marginRight: "10px" }} />
//                     <p style={{ color: "gray", fontFamily: "montserrat" }}>OR</p>
//                     <hr style={{ flex: 1, marginLeft: "10px" }} />
//                 </div>
//                 <div style={{ marginTop: '30px' }} >
//                     <p style={{ marginBottom: '30px', fontWeight: '600' }}>Upload up using .csv</p>
//                     <input type="file" accept=".csv" onChange={handleFileChange} />
//                     <button style={{ width: '100px', height: '30px', color: 'white', backgroundColor: '#28679e', border: 'none', cursor: 'pointer' }} onClick={handleUpload}>Upload CSV</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Uploadquestions;
import React, { useState } from "react";
import Navbar1 from "./Navbar1";
import axios from "axios";

const Uploadquestions = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // State to store image URL
  const [answers, setAnswers] = useState([""]);

  const handleChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value === "select") {
      setAnswers(["", "", "", ""]); // initialize 4 empty answers for multiple select
    } else {
      setAnswers([""]); // initialize with a single empty answer for other types
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(",")[1]; // Extract base64 string

          // Upload image to ImgBB
          const response = await axios.post(
            "https://api.imgbb.com/1/upload?expiration=600&key=1927edb8a3d4c8a7d375dc20726dacab",
            new URLSearchParams({
              image: base64Image,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          // Set the image URL from ImgBB response
          setImageUrl(response.data.data.url);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnswerChange = (e, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = e.target.value;
    setAnswers(newAnswers);
  };

  const quesType = (type) => {
    if (type === "fill") {
      return "Fill Up";
    }
    if (type === "select") {
      return "Multiple Select";
    }
    return "Multiple Choice";
  };

  const handleSave = async (apiEndpoint) => {
    const questionData = {
      question: document.getElementsByName("ques")[0].value,
      options:
        selectedOption !== "fill"
          ? [
              document.getElementsByName("opt1")[0].value,
              document.getElementsByName("opt2")[0].value,
              document.getElementsByName("opt3")[0].value,
              document.getElementsByName("opt4")[0].value,
            ]
          : null,
      type: quesType(selectedOption),
      topic: document.getElementsByName("topic")[0].value,
      difficulty: document.getElementsByName("diff")[0].value,
      company: document.getElementsByName("company")[0].value,
      answer:
        selectedOption === "select"
          ? [
              document.getElementsByName("ans1")[0].value,
              document.getElementsByName("ans2")[0].value,
              document.getElementsByName("ans3")[0].value,
              document.getElementsByName("ans4")[0].value,
            ]
          : [document.getElementsByName("ans")[0].value],
      image_url: imageUrl, // Use image URL from ImgBB
    };
      
    console.log(questionData)

    try {
      const response = await axios.post(
        `http://localhost:5000/${apiEndpoint}`,
        questionData, // Send JSON data directly
        {
          headers: {
            "Content-Type": "application/json", // Set Content-Type to application/json
          },
        }
      );
      console.log("Data posted successfully:", response.data);
    } catch (error) {
      alert("Error posting data:", error);
    }
  };


  const handleSaveAndAddAnother = (apiEndpoint) => {
    handleSave(apiEndpoint);
    window.location.reload();
  };

  return (
    <div>
      <Navbar1 />
      <h1 style={{ marginTop: "20px", fontWeight: "500", textAlign: "center" }}>
        Hey admins, Upload your questions
      </h1>

      <div className="container">
        <label className="label" htmlFor="type">
          Question type
        </label>
        <select
          className="select-field"
          name="type"
          onChange={handleChange}
          value={selectedOption}
        >
          <option value="">--Question type--</option>
          <option value="choice">Multiple choice</option>
          <option value="select">Multiple select</option>
          <option value="fill">Fill up</option>
        </select>

        <label className="label" htmlFor="question">
          Question:
        </label>
        <textarea
          className="textarea-field"
          placeholder="Enter your question here"
          name="ques"
        />

        <label className="label" htmlFor="topic">
          Topic:
        </label>
        <input
          className="input-field"
          type="text"
          placeholder="Topic"
          name="topic"
        />

        <label className="label" htmlFor="difficulty">
          Difficulty:
        </label>
        <input
          className="input-field"
          type="text"
          placeholder="Difficulty"
          name="diff"
        />

        <label className="label" htmlFor="company">
          Company:
        </label>
        <input
          className="input-field"
          type="text"
          placeholder="Company"
          name="company"
        />

        {(selectedOption === "choice" || selectedOption === "select") && (
          <>
            <div className="opt">
              <label className="label" htmlFor="option1">
                Option 1:
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Option 1"
                name="opt1"
              />

              <label className="label" htmlFor="option2">
                Option 2:
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Option 2"
                name="opt2"
              />

              <label className="label" htmlFor="option3">
                Option 3:
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Option 3"
                name="opt3"
              />

              <label className="label" htmlFor="option4">
                Option 4:
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Option 4"
                name="opt4"
              />
            </div>
          </>
        )}

        {(selectedOption === "choice" || selectedOption === "fill") && (
          <div>
            <label className="label" htmlFor="answer">
              Answer:
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Answer"
              value={answers[0]}
              onChange={(e) => handleAnswerChange(e, 0)}
              name="ans"
            />
          </div>
        )}

        {selectedOption === "select" && (
          <div>
            <label className="label" htmlFor="answers">
              Answers:
            </label>
            {answers.map((answer, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  className="input-field"
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={answer}
                  onChange={(e) => handleAnswerChange(e, index)}
                  name={`ans${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        <label className="label" htmlFor="image">
          Upload Image:
        </label>
        <input type="file" onChange={handleImageChange} />

        <button
          className="button1"
          style={{ marginLeft: "20px" }}
          onClick={() => handleSave("api/tech_questions")}
        >
          Save to Tech Questions
        </button>
        <button
          className="button1"
          style={{ marginLeft: "20px", width: "220px" }}
          onClick={() => handleSaveAndAddAnother("api/tech_questions")}
        >
          Save & Add Another to Tech
        </button>
        <button
          className="button1"
          style={{ marginLeft: "20px" }}
          onClick={() => handleSave("api/verb_questions")}
        >
          Save to Verb Questions
        </button>
        <button
          className="button1"
          style={{ marginLeft: "20px", width: "220px" }}
          onClick={() => handleSaveAndAddAnother("api/verb_questions")}
        >
          Save & Add Another to Verb
        </button>
        <button
          className="button1"
          style={{ marginLeft: "20px" }}
          onClick={() => handleSave("api/apt_questions")}
        >
          Save to Apt Questions
        </button>
        <button
          className="button1"
          style={{ marginLeft: "20px", width: "220px" }}
          onClick={() => handleSaveAndAddAnother("api/apt_questions")}
        >
          Save & Add Another to Apt
        </button>
      </div>
    </div>
  );
};

export default Uploadquestions;
