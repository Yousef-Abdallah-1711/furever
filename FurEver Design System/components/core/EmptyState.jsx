import React from 'react';
import {Icon} from './Icon.jsx';
import {Button} from './Button.jsx';
export function EmptyState({icon='paw-print',title,body,action,onAction,tone}){
  return <div style={{textAlign:'center',padding:'32px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
    <div className="fe-ph" style={{width:112,height:112,borderRadius:'50%',color:tone==='danger'?'var(--danger)':'var(--primary)'}}><Icon name={icon} size={44}/></div>
    <div className="t-h3">{title}</div>{body&&<div className="t-cap" style={{maxWidth:280,fontSize:'var(--fs-body)'}}>{body}</div>}
    {action&&<Button variant={tone==='danger'?'outline':'primary'} size="m" onClick={onAction}>{action}</Button>}
  </div>;
}