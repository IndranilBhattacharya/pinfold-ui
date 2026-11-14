import * as React from 'react';
import { stepperMeta } from '@pinfold/core/meta';
import { inactiveStepperOptions } from '@pinfold/core';
import { Card } from '@pinfold/react/card';
import { Input } from '@pinfold/react/input';
import { Radio } from '@pinfold/react/radio';
import { defineStepper } from '@pinfold/react/stepper';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Toggle, usePage } from '../playground/kit';
import { Order } from './table';

/** The stepper page. */

function CartStep() {
  return (
    <ul className="dx-lines">
      <li><span>Wool overshirt · M</span><span>$118.00</span></li>
      <li><span>Canvas tote</span><span>$34.00</span></li>
      <li className="dx-lines__total"><span>Subtotal</span><span>$152.00</span></li>
    </ul>
  );
}
function ShippingStep({ address, setAddress, error }: { address: string; setAddress: (v: string) => void; error?: string }) {
  return (
    <div className="dx-panel">
      <Input label="Full name" defaultValue="Maya Chen" />
      <Input label="Street address" value={address} onChange={setAddress} error={error} required placeholder="12 Harbour Road" />
    </div>
  );
}
function PaymentStep() {
  return (
    <Radio
      label="Pay with"
      variant="card"
      defaultValue="card"
      items={[
        { value: 'card', label: 'Card', description: 'Visa ending 4242' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'invoice', label: 'Invoice', description: 'Due in 30 days' },
      ]}
    />
  );
}
function ReviewStep({ address }: { address: string }) {
  return (
    <ul className="dx-lines">
      <li><span>Ship to</span><span>{address || '—'}</span></li>
      <li><span>Pay with</span><span>Card ending 4242</span></li>
      <li className="dx-lines__total"><span>Total</span><span>$152.00</span></li>
    </ul>
  );
}
const WIZARD = [
  { label: 'Cart', description: '2 items' },
  { label: 'Shipping', description: 'Where it goes' },
  { label: 'Payment', optional: true },
  { label: 'Review' },
];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A checkout: the stepper drives the panels; Next checks the address first. */
function Checkout({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _async, _markError, ...rest } = props;
  const [step, setStep] = React.useState(0);
  const [address, setAddress] = React.useState('');
  const [error, setError] = React.useState<string>();
  const validate = () => {
    const ok = address.trim().length > 3;
    setError(ok ? undefined : 'Enter the street address.');
    return ok;
  };
  const items = [
    { ...WIZARD[0], content: <CartStep /> },
    { ...WIZARD[1], error: _markError && !!error, content: <ShippingStep address={address} setAddress={(v) => (setAddress(v), setError(undefined))} error={error} /> },
    { ...WIZARD[2], content: <PaymentStep /> },
    { ...WIZARD[3], content: <ReviewStep address={address} /> },
  ];
  const done = (
    <div className="dx-panel dx-done">
      <strong>Order placed.</strong>
      <span className="dx-hint">A receipt is on its way to maya@example.com.</span>
      <div><Button label="Start over" size="sm" variant="soft" onClick={() => (setStep(0), setAddress(''))} /></div>
    </div>
  );
  return (
    <Preset
      {...rest}
      items={items}
      value={step}
      onChange={setStep}
      onNext={(s: number) => (s !== 1 ? true : _async ? wait(700).then(validate) : validate())}
      onComplete={() => wait(600)}
      doneContent={done}
    />
  );
}

/** Progress only: the stepper beside your own flow, its value from your state. */
function StepsOnly({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _back, ...rest } = props;
  const [step, setStep] = React.useState<number>(rest.value);
  React.useEffect(() => setStep(rest.value), [rest.value]);
  return <Preset {...rest} value={step} onChange={_back ? setStep : undefined} />;
}

export function StepperPlayground() {
  const page = usePage(stepperMeta, ['size', 'tone'], { _content: true, _async: true, _error: true, _step: '1', _back: true });
  const content = !!page.inputs._content;
  const inactive = inactiveStepperOptions({ ...page.options, onChange: content || page.inputs._back ? () => {} : undefined, items: content ? [{ content: 1 }] : [] });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  let spec: ExampleSpec;
  if (content) {
    spec = {
      name: 'Checkout',
      preset: set,
      body: [
        'const [step, setStep] = useState(0);',
        "const [address, setAddress] = useState('');",
        `const checkAddress = ${page.inputs._async ? "async () => (await api.validateAddress(address)).ok; // Next shows loading meanwhile" : '() => address.trim().length > 3;'}`,
      ],
      tree: [
        {
          app: Checkout,
          use: {
            items: [
              { ...WIZARD[0], content: src(null, '<Cart />') },
              { ...WIZARD[1], content: src(null, '<ShippingForm address={address} onChange={setAddress} />'), error: page.inputs._error ? src(false, '!addressValid') : undefined },
              { ...WIZARD[2], content: src(null, '<Payment />') },
              { ...WIZARD[3], content: src(null, '<Review />') },
            ],
            value: src(0, 'step'),
            onChange: src(() => {}, 'setStep'),
            onNext: src(() => true, '(step) => step !== 1 || checkAddress()'),
            onComplete: src(() => {}, 'placeOrder'),
            doneContent: src(null, '<OrderPlaced onRestart={() => setStep(0)} />'),
            _async: src(!!page.inputs._async, ''),
            _markError: src(!!page.inputs._error, ''),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else {
    const use: Record<string, unknown> = { value: src(Number(page.inputs._step), String(page.inputs._step)), items: ['Cart', 'Shipping', 'Payment', 'Review'], _back: src(!!page.inputs._back, '') };
    if (page.inputs._back) use.onChange = src(() => {}, 'setStep');
    spec = { name: 'Steps', preset: set, tree: [{ app: StepsOnly, use, code: ['$TAG'] }] };
  }
  return (
    <Page
      meta={stepperMeta}
      page={page}
      define={defineStepper}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/checkout"
      note={
        content
          ? 'Try Next on Shipping with an empty address: onNext keeps you there (after a check when it is async). Done steps go back; Finish waits on onComplete.'
          : 'Steps already done are buttons that go back (with onChange); steps not reached never are, unless linear is off.'
      }
      demo={
        <>
          <div className="dx-opts">
            <Toggle page={page} name="_content" label="steps with content, Back and Next" />
          </div>
          {content ? (
            <div className="dx-opts">
              <Toggle page={page} name="_async" label="async check on Next" />
              <Toggle page={page} name="_error" label="mark the step with an error" />
            </div>
          ) : (
            <>
              <Choice page={page} name="_step" label="current step" options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 (all done)']]} />
              <div className="dx-opts">
                <Toggle page={page} name="_back" label="steps are buttons (onChange)" />
              </div>
            </>
          )}
        </>
      }
    />
  );
}
