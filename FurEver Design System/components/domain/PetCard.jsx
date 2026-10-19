import React from 'react';
import {Card} from '../core/Card.jsx';
import {StatusBadge} from '../core/StatusBadge.jsx';
import {Icon} from '../core/Icon.jsx';
export function PetCard({name,breed,age,status,statusLabel,onClick}){
  return <Card onClick={onClick} pad={12} style={{display:'flex',gap:12,alignItems:'center'}}>
    <div className="fe-ph" style={{width:64,height:64,borderRadius:14,flex:'none'}}>photo</div>
    <div style={{flex:1,minWidth:0}}><div className="t-h3" style={{fontSize:'var(--fs-body-lg)'}}>{name}</div><div className="t-cap">{breed} · {age}</div><div style={{marginTop:6}}><StatusBadge status={status}>{statusLabel}</StatusBadge></div></div>
    <Icon name="chevron-right" flip size={20} style={{color:'var(--text-secondary)'}}/>
  </Card>;
}