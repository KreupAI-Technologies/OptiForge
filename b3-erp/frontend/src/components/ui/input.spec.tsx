import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';
import { Mail } from 'lucide-react';

describe('Input Component', () => {
    it('renders correctly with label', () => {
        render(<Input label="Email" placeholder="Enter email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('shows asterisk when required', () => {
        render(<Input label="Required Field" required />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message and applies error classes', () => {
        render(<Input label="Field" error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('displays helper text when no error', () => {
        render(<Input label="Field" helperText="Helpful info" />);
        expect(screen.getByText('Helpful info')).toBeInTheDocument();
    });

    it('should not display helper text if error is present', () => {
        render(<Input label="Field" helperText="Helpful info" error="Error message" />);
        expect(screen.queryByText('Helpful info')).not.toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const handleChange = jest.fn();
        render(<Input placeholder="Type here" onChange={handleChange} />);
        const input = screen.getByPlaceholderText('Type here');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('toggles password visibility', () => {
        render(<Input label="Password" type="password" placeholder="PassPH" />);
        const input = screen.getByPlaceholderText('PassPH');
        expect(input).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute('type', 'password');
    });

    it('renders left and right icons', () => {
        render(
            <Input
                leftIcon={<Mail data-testid="left-icon" />}
                rightIcon={<div data-testid="right-icon">R</div>}
            />
        );
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
        expect(screen.getByRole('textbox')).toHaveClass('cursor-not-allowed');
    });
});
