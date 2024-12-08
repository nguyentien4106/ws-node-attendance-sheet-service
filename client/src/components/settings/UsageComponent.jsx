import React from 'react';

// UsageComponent: Display CPU, RAM, and Storage usage
const UsageComponent = ({ usage }) => {
    if (!usage) {
        return <div>Loading...</div>; // Handle empty or loading state
    }

    const { cpu, ram, storage } = usage;

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <h5>CPU Usage</h5>
                <p>Used: {cpu.usagePercent}%</p>
                <p>Available: {cpu.availablePercent}%</p>
            </div>
            <div style={styles.section}>
                <h5>RAM Usage</h5>
                <p>Total: {ram.totalMem}</p>
                <p>Used: {ram.used} ({ram.usagePercent}%)</p>
                <p>Available: {ram.free} ({ram.availablePercent}%)</p>
            </div>
        </div>
    );
};

// Styles
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: '300px',
        margin: '20px auto',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    },
    section: {
        marginBottom: '20px',
    },
};

export default UsageComponent;
