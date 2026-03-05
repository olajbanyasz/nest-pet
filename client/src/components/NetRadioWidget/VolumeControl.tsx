import { Button } from 'primereact/button';
import React from 'react';

interface VolumeControlProps {
  volume: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgb(221, 221, 221)',
        borderRadius: 6,
        padding: '3px 4px',
        margin: '0 8px',
      }}
    >
      <Button
        icon="pi pi-caret-up"
        text
        aria-label="Volume up"
        onClick={onIncrease}
        style={{
          width: 16,
          height: 16,
          padding: 0,
          outline: 'none',
          boxShadow: 'none',
          color: 'white',
        }}
      />
      <span
        style={{
          fontSize: 11,
          minWidth: 32,
          textAlign: 'center',
          color: 'white',
        }}
      >
        {volume}%
      </span>
      <Button
        icon="pi pi-caret-down"
        text
        aria-label="Volume down"
        onClick={onDecrease}
        style={{
          width: 16,
          height: 16,
          padding: 0,
          outline: 'none',
          boxShadow: 'none',
          color: 'white',
        }}
      />
    </div>
  );
};

export default VolumeControl;
