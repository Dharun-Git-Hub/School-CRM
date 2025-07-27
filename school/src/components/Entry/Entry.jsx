import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/styles.css'

const Entry = () => {
    const navigate = useNavigate()
    return (
        <div className='entry'>
            <span className='entry-span'>School CRM</span>
            <button className='entry-btn' onClick={()=>navigate('/login-grade')}>Grade Admin</button>
            <button className='entry-btn' onClick={()=>navigate('/login-super')}>Super Admin</button>
            <button className='entry-btn' onClick={()=>navigate('/login-staff')}>Teacher/Staff</button>
            <button className='entry-btn' onClick={()=>navigate('/login-student')}>Student</button>
        </div>
    )
}

export default Entry