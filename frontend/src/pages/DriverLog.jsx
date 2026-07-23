import React from 'react';
import { Link } from 'react-router-dom';

const DriverLog = () => {
    return (
        <div>
            <h1>Driver Log</h1>
            <p>Blank paper log will be implemented here.</p>
            <nav>
                <ul>
                    <li><Link to="/">Back to Dashboard</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default DriverLog;
