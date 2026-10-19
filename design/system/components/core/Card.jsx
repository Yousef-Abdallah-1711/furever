import React from 'react';
export function Card({children,onClick,pad=16,tint=false,style}){
  return <div className="fe-card" onClick={onClick} style={{padding:pad,cursor:onClick?'pointer':undefined,background:tint?'var(--surface-secondary)':undefined,borderColor:tint?'var(--primary)':undefined,...style}}>{children}</div>;
}