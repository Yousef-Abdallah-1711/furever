import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Button({variant='primary',size='l',block=false,loading=false,disabled=false,icon,children,onClick,style,type='button'}){
  return <button type={type} className={['fe-btn',variant,size,block&&'block',loading&&'loading'].filter(Boolean).join(' ')} disabled={disabled} onClick={onClick} style={style} aria-busy={loading||undefined}>
    {loading?<span className="fe-spin"/>:icon&&<Icon name={icon} size={20}/>}{children}
  </button>;
}