# Three-step registration form

React + TypeScript + Tailwind CSS + Redux Toolkit. Controlled inputs keep the logic small. No backend or API key needed.

## Run

Use Node.js 22.12+ or a supported newer version.

```sh
npm install
npm run dev
```

Open the localhost URL printed in the terminal.

```sh
npm test
npm run build
```

## How it works

1. **User Info**: full name and email are required; email format is checked.
2. **Address**: street, city, postal code, and country are required. Postal codes are text to support letters and leading zeros.
3. **Review**: show entered values, go back to edit, then validate all fields on submission.

`src/form.ts` contains the types, field definitions, and plain validation function.

`src/store.ts` creates a Redux slice with three actions: updateField, setStep, resetForm. Redux holds the input values and current step. Validation errors and the temporary success message stay in React state.

`src/storage.ts` reads the draft at startup, checks its shape, and handles invalid JSON or unavailable storage safely.

`src/App.tsx` uses controlled inputs: value comes from Redux; onChange dispatches updateField. A useEffect saves Redux form changes to localStorage. Refreshing creates a new store from the saved draft, including the current step. Back navigation preserves values. Forward navigation validates the current step.

Successful submission is a local demo: it resets Redux and removes the draft. Nothing is sent to a server or registered with a real service. Refresh after completion starts a new form. The demo stores only these fields; there is no password field. Persistence is for this browser and origin; cross-tab synchronization is outside this example.

## Try it

- Press Next with empty inputs: errors appear and the step stays unchanged.
- Enter a name and invalid email: Next rejects the email.
- Enter valid user info, continue, and type part of an address. Refresh: fields and step are restored.
- Complete the address, review, go Back, and edit. Review reflects the changes.
- Submit: the demo success screen appears and the local draft is cleared.

Redux setup reference: https://redux.js.org/tutorials/quick-start
