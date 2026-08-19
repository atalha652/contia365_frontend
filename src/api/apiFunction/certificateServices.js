import { CERTIFICATE_URL } from "../restEndpoint";
import { httpPostBlob } from "../../utils/httpMethods";

// Upload user's .p12 digital certificate for AEAT VeriFactu signing.
// The password is validated server-side then discarded — never stored.
export const uploadCertificate = async ({ file, password }) => {
  const form = new FormData();
  form.append("certificate", file);
  form.append("cert_password", password);
  const response = await httpPostBlob({ url: CERTIFICATE_URL, payload: form });
  return response;
};
