import { fields, initialState, validate, type RegistrationState } from './form';

export const STORAGE_KEY = 'registration-draft-v1';

export function loadDraft(): RegistrationState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    // Ignore broken or outdated stored data instead of crashing the app.
    if (!saved || ![1, 2, 3].includes(saved.step) || !saved.data) return initialState;
    const data = { ...initialState.data };
    for (const { name } of fields) {
      if (typeof saved.data[name] !== 'string') return initialState;
      data[name] = saved.data[name];
    }
    let step = saved.step as RegistrationState['step'];
    if (step > 1 && Object.keys(validate(data, 1)).length) step = 1;
    else if (step > 2 && Object.keys(validate(data, 2)).length) step = 2;
    return { step, data };
  } catch {
    return initialState;
  }
}

export function saveDraft(state: RegistrationState): boolean {
  try {
    // A reset or successful demo submission removes the saved draft.
    if (Object.values(state.data).every(value => value === '')) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
