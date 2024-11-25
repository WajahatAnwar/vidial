import { useState } from 'react'
import "@/ReactJs/Components/toggleLogin.css";
import React from "react";
export const ToggleLogin = ({ label, toggled, onClick }) => {

    return (
        <div id='customToggle'>
            <label>
                {/* checked is the real setup */}
                <input type="checkbox" checked={toggled} onChange={onClick} />
                <span />
                <strong>{label}</strong>
            </label>
        </div>
    )
}
export default ToggleLogin;
