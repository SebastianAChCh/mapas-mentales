import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Login from '../Login';

describe('Login component', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows validation errors for invalid email and short password', async () => {
    render(<Login />);

    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole('button', { name: /login/i });

    fireEvent.change(email, { target: { value: 'bad' } });
    fireEvent.change(password, { target: { value: '123' } });
    fireEvent.click(submit);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('disables button and shows logging state on submit then returns after timeout', async () => {
    jest.useFakeTimers();

    render(<Login />);

    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole('button', { name: /login/i });

    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(password, { target: { value: 'abcdef' } });
    fireEvent.click(submit);

    expect(submit).toBeDisabled();
    expect(submit).toHaveTextContent(/Logging in.../i);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/Login/i));
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
