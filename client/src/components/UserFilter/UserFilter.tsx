import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import React from 'react';

interface UserFilterProps {
  userFilter: string;
  setUserFilter: (filter: string) => void;
  isValidFilter: boolean;
  showDeletedOnly: boolean;
  setShowDeletedOnly: (value: boolean) => void;
}

function UserFilter({
  userFilter,
  setUserFilter,
  isValidFilter,
  showDeletedOnly,
  setShowDeletedOnly,
}: UserFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.trim();
    setUserFilter(next);
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        marginBottom: '10px',
        borderBottom: '1px solid rgb(221, 221, 221)',
      }}
    >
      <i
        className="pi pi-filter"
        style={{
          fontSize: '1.5rem',
          marginRight: '8px',
          color: isValidFilter ? '#0ea5e9' : 'gray',
        }}
      ></i>
      <InputText
        value={userFilter}
        onChange={handleChange}
        style={{ flexGrow: 1, marginRight: '10px' }}
        placeholder="Filter users by email"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '135px'}}>
        <span style={{ fontSize: '0.85rem', color: '#666' }}>
          {showDeletedOnly ? 'Deleted only' : 'Active only'}
        </span>
        <InputSwitch
          checked={showDeletedOnly}
          onChange={(e) => {
            setShowDeletedOnly(!!e.value);
          }}
        />
      </div>
    </div>
  );
}

export default UserFilter;
