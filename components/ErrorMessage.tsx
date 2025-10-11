
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="w-full max-w-2xl mx-auto p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
    <p className="font-bold">An Error Occurred</p>
    <p>{message}</p>
  </div>
);

export default ErrorMessage;
