import React from 'react';
export function PhaseTag({phase=2,children}){
  return <span className="fe-phase">{children||('Later phase · '+phase)}</span>;
}