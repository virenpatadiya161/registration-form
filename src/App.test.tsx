// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import { createAppStore } from './store';
import { STORAGE_KEY } from './storage';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function mount() {
  const store = createAppStore();
  return { store, ...render(<Provider store={store}><App /></Provider>) };
}
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
function next() { fireEvent.click(screen.getByRole('button', { name: 'Next' })); }
function userInfo() { fill('Full name', 'Sam Patel'); fill('Email', 'sam@example.com'); next(); }

it('blocks empty fields and invalid email', () => {
  const { store } = mount();
  next();
  expect(screen.getByText('Full name is required.')).toBeTruthy();
  fill('Full name', '   ');
  fill('Email', 'invalid');
  next();
  expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  expect(store.getState().registration.step).toBe(1);
  userInfo();
  next();
  expect(screen.getByText('Street address is required.')).toBeTruthy();
  expect(store.getState().registration.step).toBe(2);
});

it('restores partially entered fields and current step with a new store', () => {
  const first = mount();
  userInfo();
  fill('Street address', '12 Park Road');
  first.unmount();
  const second = mount();
  expect(second.store.getState().registration.step).toBe(2);
  expect((screen.getByLabelText('Street address') as HTMLInputElement).value).toBe('12 Park Road');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Sam Patel');
});

it('reviews edits and clears the persisted draft after submission', () => {
  const { store } = mount();
  userInfo();
  fill('Street address', '12 Park Road');
  fill('City', 'Pune');
  fill('Postal code', '411001');
  fill('Country', 'India');
  next();
  expect(screen.getByText('Pune')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fill('City', 'Mumbai');
  next();
  expect(screen.getByText('Mumbai')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }));
  expect(screen.getByText('Registration complete (demo)')).toBeTruthy();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(store.getState().registration.data.fullName).toBe('');
});

it('ignores corrupt storage and prevents restoring an invalid later step', () => {
  localStorage.setItem(STORAGE_KEY, 'broken json');
  expect(createAppStore().getState().registration.step).toBe(1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: 3, data: {
    fullName: '', email: '', street: '', city: '', postalCode: '', country: '',
  } }));
  expect(createAppStore().getState().registration.step).toBe(1);
});

it('keeps the form usable when storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable'); });
  mount();
  userInfo();
  expect(screen.getByLabelText('Street address')).toBeTruthy();
  expect(screen.getByText('Browser storage is unavailable. Your entries will be lost on refresh.')).toBeTruthy();
});
