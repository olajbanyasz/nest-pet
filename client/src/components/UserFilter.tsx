import React from "react";
import { InputText } from "primereact/inputtext";

interface UserFilterProps {
    userFilter: string;
    setUserFilter: (filter: string) => void;
}

function UserFilter({ userFilter, setUserFilter }: UserFilterProps) {

    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '10px', borderBottom: '1px solid rgb(221, 221, 221)' }}>
            <i className="pi pi-filter" style={{ fontSize: '1.5rem', marginRight: '8px', color: '#0ea5e9' }}></i>
            <InputText
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value.trim())}
                style={{ flexGrow: 1, marginRight: '10px' }}
                placeholder="Filter users by email"
            />
        </div>);
};

export default UserFilter;