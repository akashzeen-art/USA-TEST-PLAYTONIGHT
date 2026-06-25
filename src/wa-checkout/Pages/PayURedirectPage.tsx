import { useLocation } from 'react-router-dom';
import PayURedirect from '../components/PayURedirect';

interface LocationState {
  actionUrl: string;
  params: Record<string, any>;
  successurl?: string;
  failurl?: string;
}

export default function PayURedirectPage() {
  const { state } = useLocation();

  if (!state) return <p>No payment details found.</p>;

  const locationState = state as LocationState;

  return (
    <PayURedirect
      actionUrl={locationState.actionUrl}
      params={locationState.params}
      successurl={locationState.successurl}
      failurl={locationState.failurl}
    />
  );
}
