import React from 'react';
import {Icon} from './Icon.jsx';
export function Input({label,hint,error,icon,value,defaultValue,placeholder,disabled,type='text',inputMode,ltr=false,onChange,prefix}){
  return <label className="fe-field">
    {label&&<span className="fe-label">{label}</span>}
    <span style={{position:'relative',display:'flex',alignItems:'center',gap:8}}>
      {prefix&&<span className="fe-input" style={{width:'auto',display:'flex',alignItems:'center',direction:'ltr',flex:'none'}}>{prefix}</span>}
      {icon&&<span style={{position:'absolute',insetInlineStart:14,color:'var(--text-secondary)',display:'flex'}}><Icon name={icon} size={20}/></span>}
      <input className={'fe-input'+(error?' error':'')} style={{paddingInlineStart:icon?44:14,direction:ltr?'ltr':undefined,textAlign:ltr?'start':undefined}} type={type} inputMode={inputMode} value={value} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled} onChange={onChange} aria-invalid={!!error}/>
    </span>
    {(error||hint)&&<span className={'fe-hint'+(error?' error':'')}>{error||hint}</span>}
  </label>;
}