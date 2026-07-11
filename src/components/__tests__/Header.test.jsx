import { render, screen } from '@testing-library/react';
import Header from '../Header';

// عدّل النصوص هنا لو اسم المشروع أو اللوجو مختلف

test('renders header component', () => {
  render(<Header />);
  // نحاول نلاقي أي نص له علاقة باسم المشروع
  const titleElement = screen.getByText(/noura/i);
  expect(titleElement).toBeInTheDocument();
});
