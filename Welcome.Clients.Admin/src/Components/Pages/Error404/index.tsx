import React from 'react';
import { useLocation } from 'react-router-dom';

export function Error404() {
  let location = useLocation();
  return (
    <div>
      <h1>The path "{location.pathname}" is not found</h1>
    </div>
  );
}
