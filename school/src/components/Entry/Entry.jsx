import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {assets} from '../../assets/assets'

import '../styles/styles.css'

const Entry = () => {
    const navigate = useNavigate()
    return (
        <div className='entry'>
            <img className='img-school' src={assets.School}/>
            <span style={{marginBottom:'15rem',backgroundImage:`url(${assets.Garden})`,backgroundClip:'text',color:'transparent',filter:'brightness(2)'}} className='entry-span'>School CRM</span>
            <button className='entry-btn' onClick={()=>navigate('/login-super')}>Super Admin</button>
            <button className='entry-btn' onClick={()=>navigate('/login-grade')}>Grade Admin</button>
            <button className='entry-btn' onClick={()=>navigate('/login-staff')}>Teacher/Staff</button>
            <button className='entry-btn' onClick={()=>navigate('/login-student')}>Student</button>
        </div>
    )
}

export default Entry