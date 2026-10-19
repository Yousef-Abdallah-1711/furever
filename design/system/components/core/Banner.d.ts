import * as React from 'react';
/**
 * @startingPoint section="Core" subtitle="Info, warning, danger, success" viewport="700x260"
 */
export interface BannerProps {
  tone?: 'info'|'warning'|'danger'|'success';
  action?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Banner(props: BannerProps): JSX.Element;
