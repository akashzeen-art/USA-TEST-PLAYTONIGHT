import { useEffect } from "react";

export default function PayURedirect({ actionUrl, params, successurl, failurl }) {
  useEffect(() => {
    if (params) {
      // Add success/fail URLs to form if backend provided them
      const form = document.getElementById("payuForm");
      if (form) {
        // Remove existing successurl/failurl inputs if any
        const existingSuccess = form.querySelector('input[name="successurl"]');
        const existingFail = form.querySelector('input[name="failurl"]');
        if (existingSuccess) existingSuccess.remove();
        if (existingFail) existingFail.remove();

        // Add backend-provided redirect URLs if available
        if (successurl) {
          const successInput = document.createElement("input");
          successInput.type = "hidden";
          successInput.name = "successurl";
          successInput.value = successurl;
          form.appendChild(successInput);
        }
        if (failurl) {
          const failInput = document.createElement("input");
          failInput.type = "hidden";
          failInput.name = "failurl";
          failInput.value = failurl;
          form.appendChild(failInput);
        }

        form.submit();
      }
    }
  }, [params, successurl, failurl]);

  if (!params) {
    return <p>No payment details found.</p>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h3 className="mb-4 font-semibold text-lg">
        Please wait, redirecting to PayU...
      </h3>

      <form id="payuForm" name="payuForm" method="post" action={actionUrl}>
        {Object.entries(params).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <noscript>
          <input type="submit" value="Click here to pay" />
        </noscript>
      </form>
    </div>
  );
}
