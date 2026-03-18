import { render, screen } from '@testing-library/react';
import React from 'react';

import App from './App';

test('renders app shell', () => {
  const { container } = render(<App />);
  // The auth initialization can defer route rendering; this should still mount the base shell.
  expect(container.querySelector('.notification-container')).toBeTruthy();
});
