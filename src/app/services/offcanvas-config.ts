import { ComponentRef, Type } from '@angular/core';

export interface OffcanvasConfig<T = any> {
  data?: T;
  backdrop?: 'static' | boolean;
  keyboard?: boolean;
  scroll?: boolean;
  width?: string;
  position?: 'start' | 'end' | 'top' | 'bottom';
  panelClass?: string | string[];
}

export interface OffcanvasRef<R = any> {
  componentInstance: any;
  componentRef: ComponentRef<any>;
  close: (result?: R) => void;
  dismiss: (reason?: any) => void;
  afterClosed: () => Promise<R | undefined>;
  afterDismissed: () => Promise<any>;
}
