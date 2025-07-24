import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Entry = () => {
    const navigate = useNavigate()
    return (
        <div>
            Entry
            <button onClick={()=>navigate('/login-grade')}>Grade Admin</button>
            <button onClick={()=>navigate('/login-super')}>Super Admin</button>
            <button onClick={()=>navigate('/login-staff')}>Teacher/Staff</button>
            <button onClick={()=>navigate('/login-student')}>Student</button>
        </div>
    )
}

export default Entry