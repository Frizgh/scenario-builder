import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

export function RouterProvider({ children }: Props) {
  return <BrowserRouter basename="/scenario-builder">{children}</BrowserRouter>;
}
