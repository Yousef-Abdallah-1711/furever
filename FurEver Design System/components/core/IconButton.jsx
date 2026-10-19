import React from 'react';
import {Icon} from './Icon.jsx';
export function IconButton({icon,label,badge,plain=false,flip=false,onClick}){
  return <button type="button" className={'fe-iconbtn'+(plain?' plain':'')} aria-label={label} title={label} onClick={onClick}>
    <Icon name={icon} size={22} flip={flip}/>
    {badge?<span style={{position:'absolute',top:6,insetInlineEnd:6,minWidth:16,height:16,borderRadius:8,background:'var(--danger)',color:'var(--on-danger)',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}>{badge}</span>:null}
  </button>;
}