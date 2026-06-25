import { useLocation } from "react-router-dom";
import PayURedirect from "../components/PayURedirect";

export default function PayURedirectPage() {
  const { state } = useLocation();

  if (!state) return <p>No payment details found.</p>;

  return (
    <PayURedirect
      actionUrl={state.actionUrl}
      params={state.params}
      successurl={state.successurl}
      failurl={state.failurl}
    />
  );
}
