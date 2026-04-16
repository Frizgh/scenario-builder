import { type ButtonHTMLAttributes } from 'react';
import s from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export default function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button className={`${s.btn} ${s[variant]} ${className}`} {...rest} />
  );
}
