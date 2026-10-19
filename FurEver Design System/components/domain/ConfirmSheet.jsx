import React from 'react';
import {Button} from '../core/Button.jsx';
export function ConfirmSheet({title,body,confirm,cancel,destructive=true,onConfirm,onCancel,children}){
  return <div className="fe-sheet-bd" onClick={onCancel}><div className="fe-sheet" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true">
    <div className="t-h2" style={{marginBottom:6}}>{title}</div>{body&&<div style={{color:'var(--text-secondary)',marginBottom:16}}>{body}</div>}{children}
    <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}><Button variant={destructive?'destructive':'primary'} block onClick={onConfirm}>{confirm}</Button><Button variant="secondary" block onClick={onCancel}>{cancel}</Button></div>
  </div></div>;
}