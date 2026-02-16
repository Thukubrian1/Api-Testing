import React from 'react';
import { LoginForm } from '../forms/LoginForm/LoginForm';

interface LoginPageProps {
  isProvider?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isProvider = false }) => {
  return <LoginForm isProvider={isProvider} />;
};