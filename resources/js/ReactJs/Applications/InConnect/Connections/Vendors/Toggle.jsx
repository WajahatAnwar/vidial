import { useState } from 'react'
import "./toggle.css";
import React from "react";
export const Toggle = ({ label, toggled, onClick }) => {

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
export default Toggle;
