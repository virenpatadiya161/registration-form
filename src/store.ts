import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { initialState, type Field, type Step } from './form';
import { loadDraft } from './storage';

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    updateField(state, action: PayloadAction<{ name: Field; value: string }>) {
      state.data[action.payload.name] = action.payload.value;
    },
    setStep(state, action: PayloadAction<Step>) { state.step = action.payload; },
    resetForm() { return initialState; },
  },
});

export const { updateField, setStep, resetForm } = registrationSlice.actions;

export function createAppStore() {
  return configureStore({
    reducer: { registration: registrationSlice.reducer },
    preloadedState: { registration: loadDraft() },
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export const useAppDispatch = useDispatch.withTypes<AppStore['dispatch']>();
export const useAppSelector = useSelector.withTypes<RootState>();
