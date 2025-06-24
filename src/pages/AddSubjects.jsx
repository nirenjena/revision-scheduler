import { useState } from "react";
import { useNavigate } from "react-router-dom";

console.log("✅ AddSubjects file loaded");

export default function AddSubjects() {
  const [subjects, setSubjects] = useState([{ name: "", date: "", difficulty: "medium" }]);
  const navigate = useNavigate();

  const handleChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", date: "", difficulty: "medium" }]);
  };

  const generateSchedule = () => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    navigate("/dashboard");
  };
<h1 style={{ fontSize: '40px', color: 'red' }}>🔥 IF YOU SEE THIS, THE FILE IS WORKING</h1>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-50 p-6">
      <div className="text-center w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">📘 Smart Study Scheduler</h1>
        <p className="text-gray-600 mb-6">
          Create a personalized study schedule that prevents burnout and maximizes your learning potential
        </p>

        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Add Study Subjects</h2>

        <div className="bg-white p-6 rounded-xl shadow-md w-full">
          {subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="e.g., Mathematics"
                value={subject.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={subject.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
                className="border p-2 rounded"
              />
              <select
                value={subject.difficulty}
                onChange={(e) => handleChange(index, "difficulty", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="easy">Easy (2 hours)</option>
                <option value="medium">Medium (4 hours)</option>
                <option value="hard">Hard (6 hours)</option>
              </select>
            </div>
          ))}
          <button onClick={addSubject} className="text-blue-600 underline mb-4">
            ➕ Add Another Subject
          </button>
          <br />
          <button
            onClick={generateSchedule}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Generate Study Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
