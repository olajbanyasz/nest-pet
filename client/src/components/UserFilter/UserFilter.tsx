import { InputText } from 'primereact/inputtext';
import React from 'react';

interface UserFilterProps {
  userFilter: string;
  setUserFilter: (filter: string) => void;
  isValidFilter: boolean;
}

function UserFilter({
  userFilter,
  setUserFilter,
  isValidFilter,
}: UserFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFilter(e.target.value.trim());
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
    </div>
  );
}

export default UserFilter;
