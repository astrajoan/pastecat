import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PasteCat', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to PasteCat/i);
  expect(welcomeElement).toBeInTheDocument();
});
