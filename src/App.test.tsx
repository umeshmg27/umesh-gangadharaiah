import { act, render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import App from './App';

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders the portfolio navigation and primary sections', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await act(async () => {
    render(<App />);
  });

  expect(screen.getByRole('heading', { name: 'Umesh' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Contact Me' })).toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith(
    '/umesh-gangadharaiah/assets/json/mentorandteam.json',
  );
});
