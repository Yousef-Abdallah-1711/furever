import React from 'react';
import {Icon} from './Icon.jsx';
export function Rating({value=0,size=18,onChange}){
  return <span style={{display:'inline-flex',gap:2,color:'var(--warning)'}} dir="ltr">{[1,2,3,4,5].map(n=>
    <span key={n} onClick={onChange?()=>onChange(n):undefined} style={{cursor:onChange?'pointer':undefined,opacity:n<=Math.round(value)?1:.3,display:'flex'}}><Icon name="star" size={size} style={{background:n<=Math.round(value)?'currentColor':'currentColor'}}/></span>)}</span>;
}