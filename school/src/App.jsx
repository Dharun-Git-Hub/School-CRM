import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Entry from './components/Entry/Entry'
import NotFound from './components/NotFound/NotFound'
import LoginSuper from './components/Login/LoginSuper'
import LoginGrade from './components/Login/LoginGrade'
import LoginStudent from './components/Login/LoginStudent'
import SuperAdminDash from './components/SuperAdmin/SuperAdminDash'
import SuperAdminForgot from './components/SuperAdmin/SuperAdminForgot'
import SuperAdminLink from './components/SuperAdmin/SuperAdminLink'
import SuperSubject from './components/SuperAdmin/SuperSubject'
import GradeAdminDash from './components/GradeAdmin/GradeAdminDash'
import GradeAdminForgot from './components/GradeAdmin/GradeAdminForgot'
import GradeAdminLink from './components/GradeAdmin/GradeAdminLink'
import TeacherDash from './components/Teacher/TeacherDash'
import LoginTeacher from './components/Login/LoginTeacher'
import TeacherForgot from './components/Teacher/TeacherForgot'
import TeacherLink from './components/Teacher/TeacherLink'
import StudentDash from './components/Student/StudentDash'
import StudentForgot from './components/Student/StudentForgot'
import StudentLink from './components/Student/StudentLink'
import GradeTimeSlots from './components/GradeAdmin/GradeTimeSlots'
import Timetable from './components/GradeAdmin/TimeTable'
import Attendance from './components/Teacher/Attendance'
import PostAssignment from './components/Teacher/PostAssignment'
import AssignmentPanel from './components/Teacher/AssignmentPanel'
import Assignments from './components/Student/Assignments'
import GradeLogs from './components/GradeAdmin/GradeLogs'
import SuperLogs from './components/SuperAdmin/SuperLogs'
import { useEffect, useRef, useState } from 'react'
import { ChatProvider } from './Context/ChatContext'
import NotificationDisplay from './Context/NotificationDisplay'
import Overview from './components/SuperAdmin/Overview'
import GradeOverview from './components/GradeAdmin/GradeOverview'
import StaffOverview from './components/Teacher/StaffOverview'
import StudentsList from './components/Teacher/StudentsList'
import Protected from './Protected'


const App = () => {
    const socketRef = useRef(null);
    const [isSocketReady, setIsSocketReady] = useState(false);

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:8000');

        socketRef.current.onopen = () => {
            console.log('WS Connected');
            setIsSocketReady(true);
        };

        socketRef.current.onclose = () => {
            console.log('WS Disconnected');
            setIsSocketReady(false);
        };

        socketRef.current.onerror = (err) => {
            console.error('WS Error:', err);
        };

        return () => {
            socketRef.current.close();
        };
    }, []);
    return (
        <BrowserRouter>
        <ChatProvider>
          <Routes>
            <Route path='/' element={<Entry/>}/>
            <Route path='/login-super' element={<LoginSuper/>}/>
            <Route path='/login-grade' element={<LoginGrade/>}/>
            <Route path='/login-staff' element={<LoginTeacher/>}/>
            <Route path='/login-student' element={<LoginStudent/>}/>
            <Route path='/grade-admin-forgot' element={<GradeAdminForgot/>}/>
            <Route path='/grade-admin-link/:id/:email' element={<GradeAdminLink/>}/>
            <Route path='/super-admin-forgot' element={<SuperAdminForgot/>}/>
            <Route path='/super-admin-link/:id/:email' element={<SuperAdminLink/>}/>
            <Route path='/teacher-forgot' element={<TeacherForgot/>}/>
            <Route path="/staff-link/:id/:email" element={<TeacherLink/>}/>
            <Route path='/student-forgot' element={<StudentForgot/>}/>
            <Route path='/student-link/:id/:email' element={<StudentLink/>}/>
            <Route element={<Protected/>}>
                <Route path='/super-admin-dash' element={<SuperAdminDash socket={socketRef.current}/>}/>
                <Route path='/super-subject' element={<SuperSubject/>}/>
                <Route path='/grade-admin-dash' element={<GradeAdminDash socket={socketRef.current}/>}/>
                <Route path='/staff-dash' element={<TeacherDash socket={socketRef.current}/>}/>
                <Route path='/student-dash' element={<StudentDash socket={socketRef.current}/>}/>
                <Route path='/grade-timeslots' element={<GradeTimeSlots/>}/>
                <Route path='/timetable' element={<Timetable/>}/>
                <Route path='/attendance' element={<Attendance/>}/>
                <Route path='/post-assignment' element={<PostAssignment/>}/>
                <Route path='/assignment-panel' element={<AssignmentPanel/>}/>
                <Route path='/assignments-student' element={<Assignments/>}/>
                <Route path="/grade-logs" element={<GradeLogs/>}/>
                <Route path="/super-logs" element={<SuperLogs/>}/>
                <Route path='/super-admin-dash/super-overview' element={<Overview/>}/>
                <Route path='/grade-admin-dash/grade-overview' element={<GradeOverview/>}/>
                <Route path='/staff-dash/staff-overview' element={<StaffOverview/>}/>
                <Route path='/staff-dash/students-listed' element={<StudentsList/>}/>
            </Route>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
          <NotificationDisplay/>
          </ChatProvider>
        </BrowserRouter>
    )
}

export default App

// Hello