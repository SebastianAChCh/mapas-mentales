import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../Register';

describe('Register component', () => {
  test('shows validation errors for short names, invalid email and weak password', async () => {
    render(<Register />);

  // use exact label text to avoid matching both "Name" and "Last Name"
  const name = screen.getByLabelText('Name');
  const lastName = screen.getByLabelText('Last Name');
    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole('button', { name: /register/i });

    fireEvent.change(name, { target: { value: 'A' } });
    fireEvent.change(lastName, { target: { value: '' } });
    fireEvent.change(email, { target: { value: 'bademail' } });
    fireEvent.change(password, { target: { value: 'abcde' } });
    fireEvent.click(submit);

    expect(await screen.findByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
  });
});
