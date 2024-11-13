import React from 'react'
import Login from '../pages/Login'

export default function Auth({ children }) {
    const auth = sessionStorage.getItem("auth") != null ? true : false

    if(auth){
        return children
    }

    return (
        <div className='d-flex flex-column justify-content-center align-items-center gap-5'>
            <h4 style={{ color: "green" }}>Bạn cần đăng nhập để thực hiện cài đặt.</h4>
            <Login />
        </div>
    )
}
