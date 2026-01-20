import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'auto'
        }}>
            <ProgressSpinner />
        </div>)
}

export default LoadingSpinner;