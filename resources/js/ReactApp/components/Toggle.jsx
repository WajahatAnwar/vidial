import { useState } from 'react'
import "./css/toggle.css";
import React from "react";
export const Toggle = ({ label, toggled, onClick }) => {
    let isChecked;
    if (toggled == "false" || toggled == false){
        isChecked=false;
    } else if (toggled == "true" || toggled == true){
        isChecked = true;
    }
    return (
        <div id='customToggle'>
            <label>
                {/* checked is the real setup */}
                <input type="checkbox" checked={isChecked} onClick={onClick} />
                <span />
                <strong>{label}</strong>
            </label>
        </div>
    )
}
export default Toggle;
