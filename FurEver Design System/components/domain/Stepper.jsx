import React from 'react';
export function Stepper({steps,current=0}){
  return <div style={{display:'flex',alignItems:'center',gap:6}}>{steps.map((s,i)=>
    <React.Fragment key={i}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:'none',minWidth:56}}>
        <div style={{width:24,height:24,borderRadius:'50%',background:i<=current?'var(--primary)':'var(--surface-secondary)',color:i<=current?'var(--on-primary)':'var(--text-secondary)',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</div>
        <span className="t-cap" style={{color:i===current?'var(--text-primary)':undefined,fontWeight:i===current?600:400,textAlign:'center'}}>{s}</span>
      </div>
      {i<steps.length-1&&<div style={{flex:1,height:2,background:i<current?'var(--primary)':'var(--border)',marginBottom:20}}/>}
    </React.Fragment>)}</div>;
}