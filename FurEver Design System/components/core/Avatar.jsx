import React from 'react';
export function Avatar({name='',size=40,src}){
  const ini=name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('');
  return <div style={{width:size,height:size,borderRadius:'50%',background:'var(--surface-secondary)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:size*.38,overflow:'hidden',flex:'none'}}>{src?<img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:ini}</div>;
}