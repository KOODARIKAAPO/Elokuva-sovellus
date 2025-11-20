import {useEffect, useState, useRef} from "react";


export default function DropdownMenu({ onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef();

useEffect(() => {
    function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => 
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
    <div className="dropdown" ref={dropdownRef}>
        <button className="dropbtn" onClick ={() => setIsOpen(!isOpen)}>
            Menu
        </button>

        {isOpen && (
        <div className="dropdown-content">
            <button className="dropdown-link" type="button" onClick={() => { if(onNavigate) onNavigate('home'); setIsOpen(false); }}>Home</button>
            <button className="dropdown-link" type="button" onClick={() => { if(onNavigate) onNavigate('jgroup'); setIsOpen(false); }}>Groups</button>
        </div>
        )}
    </div>
    );
}