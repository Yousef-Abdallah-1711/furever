import React from 'react';
import {Icon} from './Icon.jsx';
const IC={info:'info',warning:'triangle-alert',danger:'circle-alert',success:'circle-check'};
export function Banner({tone='info',action,children}){
  return <div className={'fe-banner '+tone} role={tone==='danger'?'alert':'status'}><Icon name={IC[tone]} size={20}/><div style={{flex:1}}>{children}</div>{action}</div>;
}