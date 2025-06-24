// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studyData, setStudyData] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem("subjects")) || [];
    setSubjects(savedSubjects);

    const scheduled = {};
    savedSubjects.forEach((sub) => {
      let hours = sub.difficulty === "easy" ? 2 : sub.difficulty === "medium" ? 4 : 6;
      const endDate = new Date(sub.date);
      const today = new Date();
      const days = Math.max(1, Math.floor((endDate - today) / (1000 * 60 * 60 * 24)));
      const dailyHour = Math.ceil(hours / days);

      for (let i = 0; i < days && today <= endDate; i++) {
        const dayKey = today.toISOString().split("T")[0];
        if (!scheduled[dayKey]) scheduled[dayKey] = [];
        scheduled[dayKey].push({
          subject: sub.name,
          hours: dailyHour,
          exam: sub.date,
        });
        today.setDate(today.getDate() + 1);
      }
    });
    setStudyData(scheduled);
  }, []);

  const dateKey = selectedDate.toISOString().split("T")[0];

  const toggleTaskDone = (index) => {
    const key = `${dateKey}-${index}`;
    if (completedTasks.includes(key)) {
      setCompletedTasks(completedTasks.filter((k) => k !== key));
    } else {
      setCompletedTasks([...completedTasks, key]);
    }
  };

  const startTimer = () => {
    setTimerOn(true);
  };

  useEffect(() => {
    let interval;
    if (timerOn) {
      interval = setInterval(() => {
        setSessionTime((s) => s + 1);
        setTotalTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerOn]);

  const percent = subjects.length
    ? Math.floor((completedTasks.length / Object.values(studyData).flat().length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-50 p-6">
      {/* Sidebar */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-4 gap-4">
          <h2 className="text-lg font-semibold text-purple-600 mb-2">📘 Study Scheduler</h2>
          <p>📚 {subjects.length} subjects scheduled</p>
          <p>📅 {Object.values(studyData).flat().length} study sessions</p>
          <p>⏱ {Math.floor(totalTime / 60)}m {totalTime % 60}s studied</p>
          <button
            className="mt-3 bg-white border px-3 py-1 rounded-lg text-sm text-red-600 hover:bg-red-50"
            onClick={() => window.location.href = "/"}
          >
            📄 Create New Schedule
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-lg font-semibold text-red-500 mb-2">🔥 Burnout Timer</h2>
          <p>Total Study Time: <span className="text-blue-600 font-bold">{Math.floor(totalTime / 60)} min</span></p>
          <p>Current Session: <span className="text-green-600 font-bold">{sessionTime}s</span></p>
          <button
            onClick={startTimer}
            className="mt-2 bg-green-500 text-white px-4 py-1 rounded-lg"
          >
            ▶ Start Studying
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">📊 Progress Tracker</h2>
          <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-xl font-bold">{percent}%</p>
          <p>🎯 Let's get started on your study journey!</p>
          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <div>
              <p className="text-blue-600 font-bold">{Object.values(studyData).flat().length}</p>
              <p>Total</p>
            </div>
            <div>
              <p className="text-green-600 font-bold">{completedTasks.length}</p>
              <p>Done</p>
            </div>
            <div>
              <p className="text-orange-600 font-bold">
                {Object.values(studyData).flat().length - completedTasks.length}
              </p>
              <p>Left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar + Tasks */}
      <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-md col-span-1">
          <h2 className="text-lg font-semibold text-black mb-2">📅 Study Calendar</h2>
          <Calendar onChange={setSelectedDate} value={selectedDate} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md col-span-2">
          <h2 className="text-lg font-semibold mb-3">📋 Tasks for {selectedDate.toDateString()}</h2>
          {studyData[dateKey]?.length ? (
            studyData[dateKey].map((task, idx) => {
              const key = `${dateKey}-${idx}`;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 mb-2 rounded border ${
                    completedTasks.includes(key)
                      ? "bg-green-100 border-green-400"
                      : "bg-blue-50 border-blue-300"
                  }`}
                >
                  <div>
                    <p className="capitalize font-medium">{task.subject} - {task.hours} hr</p>
                    <small>Exam: {new Date(task.exam).toDateString()}</small>
                  </div>
                  <button
                    onClick={() => toggleTaskDone(idx)}
                    className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50"
                  >
                    {completedTasks.includes(key) ? "Undo" : "✔ Mark Done"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No tasks for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
