import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fields, validate, type Errors, type Step } from './form';
import { resetForm, setStep, updateField, useAppDispatch, useAppSelector } from './store';
import { saveDraft } from './storage';

const steps = ['User Info', 'Address', 'Review'];
const buttonClass = 'rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export default function App() {
  const dispatch = useAppDispatch();
  const registration = useAppSelector(state => state.registration);
  const { step, data } = registration;
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);

  // Redux holds the live form. localStorage keeps a copy between page loads.
  useEffect(() => { setStorageAvailable(saveDraft(registration)); }, [registration]);
  useEffect(() => { heading.current?.focus(); }, [step, submitted]);

  function goToStep(nextStep: Step) {
    setErrors({});
    dispatch(setStep(nextStep));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(data, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      // Final submission validates every field, even after navigating back.
      if (step === 3) dispatch(setStep(nextErrors.fullName || nextErrors.email ? 1 : 2));
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }
    if (step < 3) dispatch(setStep((step + 1) as Step));
    else {
      // Demo only: a real application would send the validated data here.
      dispatch(resetForm());
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">React · Redux practice</p>
        <h1 className="mt-2 text-3xl font-bold">Registration</h1>
        <p className="mt-3 text-sm text-slate-500">Three simple steps. Refresh the page to try draft recovery.</p>

        {submitted ? (
          <div className="mt-8">
            <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold">Registration complete (demo)</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Validation passed. No data was sent to a server. {storageAvailable ? 'Your saved draft has been cleared.' : 'Browser storage could not be cleared.'}</p>
            <button onClick={() => setSubmitted(false)} className={`${buttonClass} mt-6 bg-indigo-600 text-white hover:bg-indigo-700`}>Start again</button>
          </div>
        ) : (
          <>
            <ol aria-label="Registration steps" className="my-7 grid grid-cols-3 gap-2">
              {steps.map((label, index) => (
                <li key={label} aria-current={step === index + 1 ? 'step' : undefined}
                  className={`rounded-lg p-3 text-center text-xs font-medium ${step === index + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {index + 1}. {label}
                </li>
              ))}
            </ol>
            <h2 ref={heading} tabIndex={-1} className="mb-5 text-xl font-semibold">{steps[step - 1]}</h2>
            <form onSubmit={handleSubmit} noValidate>
              {step < 3 ? (
                <div className="space-y-5">
                  {fields.filter(field => field.step === step).map(field => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium">{field.label}</label>
                      <input id={field.name} name={field.name} type={field.name === 'email' ? 'email' : 'text'}
                        autoComplete={field.autoComplete} required value={data[field.name]}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                        onChange={event => {
                          dispatch(updateField({ name: field.name, value: event.target.value }));
                          setErrors(current => ({ ...current, [field.name]: undefined }));
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500" />
                      {errors[field.name] && <p id={`${field.name}-error`} className="mt-1 text-sm text-red-600">{errors[field.name]}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-sm text-slate-500">Check your details before finishing.</p>
                  <dl className="divide-y divide-slate-100">
                    {fields.map(field => <div key={field.name} className="py-3">
                      <dt className="text-xs text-slate-500">{field.label}</dt>
                      <dd className="mt-1 break-words text-sm font-medium">{data[field.name]}</dd>
                    </div>)}
                  </dl>
                  <button type="button" onClick={() => goToStep(1)} className="mt-3 text-sm font-medium text-indigo-600 underline">Edit user info</button>
                </div>
              )}
              <div className="mt-7 flex justify-between gap-3">
                {step > 1 ? <button type="button" onClick={() => goToStep((step - 1) as Step)} className={`${buttonClass} bg-slate-100 hover:bg-slate-200`}>Back</button> : <span />}
                <button type="submit" className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}>{step === 3 ? 'Submit registration' : 'Next'}</button>
              </div>
            </form>
          </>
        )}
        <p role="status" className="mt-6 text-xs text-slate-500">
          {storageAvailable ? (submitted ? 'Draft cleared.' : 'Changes are saved automatically in this browser.') : 'Browser storage is unavailable. Your entries will be lost on refresh.'}
        </p>
      </section>
    </main>
  );
}
