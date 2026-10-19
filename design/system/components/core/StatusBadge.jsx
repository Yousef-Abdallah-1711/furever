import React from 'react';
const MAP={pending:'warning',confirmed:'info',checked_in:'primary',in_progress:'info',completed:'success',cancelled:'neutral',no_show:'danger',up_to_date:'success',due_soon:'warning',overdue:'danger',verified:'success',self_reported:'neutral'};
export function StatusBadge({status,children}){
  return <span className={'fe-badge '+(MAP[status]||'neutral')}><i/>{children}</span>;
}