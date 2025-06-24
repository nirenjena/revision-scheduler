import React from "react";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function App() {
  /* ---------------- state ---------------- */
  const [subjects, setSubjects] = useState([{ name: "", date: "", difficulty: "medium" }]);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [progress, setProgress] = useState({});
  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  /* ---------------- burnout timer ---------------- */
  useEffect(() => {
    let timer;
    if (isStudying && studyStartTime) {
      timer = setInterval(() => {
        const h = Math.floor((Date.now() - studyStartTime) / 3600000);
        setTotalStudyTime(h);
        if (h >= 2) {
          alert("⚠️ Burnout Warning: 2 + hours! Take a break.");
          setIsStudying(false);
          setStudyStartTime(null);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStudying, studyStartTime]);

  /* ---------------- helpers ---------------- */
  const handleChange = (i, f, v) =>
    setSubjects(s => { const c=[...s]; c[i][f]=v; return c; });

  const addSubject = () => setSubjects(s => [...s,{name:"",date:"",difficulty:"medium"}]);

  const toggleDone = key => setProgress(p => ({ ...p, [key]: !p[key] }));

  /* ---------------- generate schedule ---------------- */
  const handleSubmit = e => {
    e.preventDefault();
    const today = new Date();
    const diffH = { easy:4, medium:6, hard:8 };
    const totals = {};
    const sched = [];

    subjects.forEach(sub => {
      const exam = new Date(sub.date);
      const days = Math.ceil((exam - today)/86400000);
      if (days <= 0) return alert(`⚠️ Invalid date for ${sub.name}`);

      const hrsPerDay = +(diffH[sub.difficulty]/days).toFixed(2);
      for (let d=0; d<days; d++){
        const dt = new Date(today); dt.setDate(today.getDate()+d);
        const ds = dt.toISOString().split("T")[0];
        if ((totals[ds]||0)+hrsPerDay>8) continue;
        sched.push({subject:sub.name,date:ds,hours:hrsPerDay});
        totals[ds]=(totals[ds]||0)+hrsPerDay;
      }
    });
    setGeneratedSchedule(sched);
    setProgress({});
  };

  /* ---------------- progress % ---------------- */
  const valid = generatedSchedule.filter(t=>{
    const subj=subjects.find(s=>s.name===t.subject);
    return subj && new Date(t.date)<new Date(subj.date);
  });
  const done  = valid.filter(t=>progress[`${t.date}-${t.subject}-${t.hours}`]).length;
  const pct   = valid.length?Math.round(done/valid.length*100):0;

  /* ***************************************************************** */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-yellow-50 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-800">Smart Revision Planner</h1>

      {/* ------------- form ------------- */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 bg-white p-6 rounded-xl shadow-xl">
        {subjects.map((s,i)=>(
          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input className="p-2 border rounded" required placeholder="Subject"
              value={s.name}        onChange={e=>handleChange(i,"name",e.target.value)}/>
            <input className="p-2 border rounded" required type="date"
              value={s.date}        onChange={e=>handleChange(i,"date",e.target.value)}/>
            <select className="p-2 border rounded"
              value={s.difficulty}  onChange={e=>handleChange(i,"difficulty",e.target.value)}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
        ))}
        <div className="flex gap-4 justify-center">
          <button type="button" onClick={addSubject} className="bg-yellow-500 text-white px-4 py-2 rounded">+ Add Subject</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Generate Schedule</button>
        </div>
      </form>

      {/* ------------- burnout tracker ------------- */}
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">🔥 Burnout Tracker</h2>
        <p>Total study time today: <strong>{totalStudyTime} h</strong></p>
        {!isStudying ? (
          <button className="bg-red-500 text-white px-6 py-2 rounded"
                  onClick={()=>{setIsStudying(true);setStudyStartTime(Date.now());}}>▶️ Start</button>
        ) : (
          <button className="bg-gray-600 text-white px-6 py-2 rounded"
                  onClick={()=>{setIsStudying(false);setStudyStartTime(null);}}>⏹ Stop</button>
        )}
      </div>

      {/* ------------- calendar ------------- */}
      {generatedSchedule.length>0 && (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">🗓️ Your Study Calendar</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <Calendar value={selectedDate} onChange={setSelectedDate}
                      className="rounded-xl border border-gray-200 shadow-md"/>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Tasks for {selectedDate.toDateString()}:
              </h3>

              {/* per-subject mini % */}
              {subjects.map((sub,idx)=>{
                const before=generatedSchedule.filter(t=>t.subject===sub.name&&new Date(t.date)<new Date(sub.date));
                const doneN=before.filter(t=>progress[`${t.date}-${t.subject}-${t.hours}`]).length;
                const p=before.length?Math.round(doneN/before.length*100):0;
                return <p key={idx} className="text-sm text-green-600">
                  📘 {sub.name}  {p}% complete (deadline {sub.date})
                </p>;
              })}

              <ul className="space-y-2 mt-4">
                {generatedSchedule
                  .filter(t=>t.date===selectedDate.toISOString().split("T")[0])
                  .map(t=>{
                    const subj   = subjects.find(s=>s.name===t.subject);
                    const dl     = new Date(subj.date); dl.setHours(0,0,0,0);
                    const td     = new Date(t.date);   td.setHours(0,0,0,0);
                    const warn   = td.getTime() === dl.getTime()-86400000;

                    const k   = `${t.date}-${t.subject}-${t.hours}`;
                    const done= progress[k];
                    const miss= td < new Date().setHours(0,0,0,0) && !done;

                    return (
                      <React.Fragment key={k}>
                        {warn && <p className="text-xs text-red-600 font-semibold">⚠️ Deadline Todayy Revise Well!</p>}
                        <li className={`p-3 border rounded-lg flex justify-between items-center shadow-sm
                                        ${miss?'bg-red-100':warn?'bg-yellow-100':'bg-gray-50'}`}>
                          <div>
                            <span className="font-medium">{t.subject}</span><br/>
                            <span className="text-gray-600">
                              {Math.floor(t.hours)} h {Math.round((t.hours%1)*60)} min
                            </span>
                            {miss && <span className="ml-2 text-red-600 font-semibold">Missed</span>}
                          </div>

                          <button
                            onClick={() => toggleDone(k)}
                            className={`px-3 py-1 text-white rounded ${done?'bg-green-500':'bg-blue-500'}`}>
                            {done?'Undo':'Done'}
                          </button>
                        </li>
                      </React.Fragment>
                    );
                  })}
              </ul>

              {generatedSchedule.filter(t=>t.date===selectedDate.toISOString().split("T")[0]).length===0 &&
               <p className="text-gray-500 italic">No tasks for this day.</p>}
            </div>
          </div>

          {/* overall % */}
          <p className="text-center font-semibold mt-6">
            🔵 Overall Progress: {pct}% completed
          </p>
        </div>
      )}
    </div>
  );
}
