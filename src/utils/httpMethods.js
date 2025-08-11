import axios from "axios";

const authToken = JSON.parse(localStorage.getItem("user"));
console.log("authToken", authToken);

export const authHttpPost = async ({ url, payload = null }) => {
  try {
    const response = await axios.post(url, payload);
    return response;
  } catch (e) {
    console.log(e);
    return e.response;
  }
};

export const httpGet = async ({ url, params = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  //   return; // Ensure function stops here
  // }

  try {
    const response = await axios.get(url, {
      headers: { Authorization: 'Bearer ' + authToken?.token },
      params: params,
    });
    return response;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      window.location.href = window.location.origin + '/login';
      localStorage.clear();
    } else {
      throw e;
    }
  }
};

export const httpPostBlob = async ({ url, payload }) => {

  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken?.token}`,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e;
  }
};



export const httpPostBlobDoc = async ({ url, payload = null }) => {
  if (!authToken) {
    window.location.href = window.location.origin + '/login';
  }
  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${authToken?.token}`,
      },
      responseType: 'blob',
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const httpPost = async ({ url, payload = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  //   return;
  // }

  try {
    const response = await axios.post(url, payload, {
      headers: { Authorization: 'Bearer ' + authToken?.token },
    });
    return response;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      window.location.href = window.location.origin + '/login';
      localStorage.clear();
    } else {
      console.log(e);
    }
    throw e;
  }
};


export const httpPut = async ({ url, payload }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }
  try {
    const response = await axios.put(url, payload, {
      headers: { Authorization: 'Bearer ' + authToken?.token },
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const httpDelete = async ({ url, payload = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }
  try {
    const config = {
      headers: {
        'Authorization': 'Bearer ' + authToken?.token,
        'Content-Type': 'application/json'
      },
      data: payload // Send payload in the request body for DELETE
    };

    const response = await axios.delete(url, config);
    return response;
  } catch (e) {
    console.log(e);
    throw e; // Re-throw the error to handle it in the calling function
  }
};

export const httpPatch = async ({ url, payload = null }) => {
  if (!authToken) {
    window.location.href = window.location.origin + '/login';
  }
  try {
    const response = await axios.patch(url, payload, {
      headers: { Authorization: 'Bearer ' + authToken?.token },
    });
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const httpGetBlob = async ({ url, params = null }) => {
  if (!authToken) {
    window.location.href = window.location.origin + '/login';
    return;
  }

  try {
    const response = await axios.get(url, {
      headers: { Authorization: 'Bearer ' + authToken?.token },
      params: params,
      responseType: 'blob',
    });
    return response;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      window.location.href = window.location.origin + '/login';
      localStorage.clear();
    } else {
      console.error('Error fetching blob:', e);
    }
    return e;
  }
};

export const httpGetWithOutToken = async ({ url, params = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }  
  try {
    const response = await axios.get(url, {
      // headers: { Authorization: 'Bearer ' + authToken.access_token },
      params: params,
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e; // Throw the error instead of returning undefined
  }
};

export const httpPostWithOutToken = async ({ url, payload = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }
  try {
    const response = await axios.post(url, payload, {
      // headers: { Authorization: 'Bearer ' + authToken.access_token }
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e; // Throw the error instead of returning it
  }
};
export const httpPutWithOutToken = async ({ url, payload = null }) => {
  // if (!authToken) {
  //   window.location.href = window.location.origin + '/login';
  // }
  try {
    const response = await axios.put(url, payload, {
      // headers: { Authorization: 'Bearer ' + authToken.access_token }
    });
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const httpPostStream = async ({ url, payload, onMessage, headers = {}, abortController }) => {
  const authToken = JSON.parse(localStorage.getItem("user"));
  let fetchHeaders = {
    ...headers,
    Authorization: `Bearer ${authToken?.token}`,
  };
  let body = payload;
  // If not FormData, assume JSON
  if (!(payload instanceof FormData)) {
    fetchHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }
  const response = await fetch(url, {
    method: "POST",
    headers: fetchHeaders,
    body,
    signal: abortController?.signal,
  });
  if (!response.body) throw new Error("No response body for streaming");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let isDone = false;
  while (!isDone) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Process SSE lines (split on single newline)
    let boundary;
    while ((boundary = buffer.indexOf("\n")) !== -1) {
      const message = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 1);
      if (message.startsWith("data:")) {
        const data = message.replace("data: ", "");
        if (data === "[DONE]") {
          isDone = true;
          onMessage && onMessage(null, true);
        } else {
          // Unescape newlines that were escaped in the backend
          const unescapedData = data.replace(/\\n/g, '\n');
          onMessage && onMessage(unescapedData, false);
        }
      } else if (message.startsWith("event: truncated")) {
        // Custom event for truncated response
        // Next line should be data: { truncated: true/false }
        const nextBoundary = buffer.indexOf("\n");
        let truncatedData = null;
        if (nextBoundary !== -1) {
          const nextLine = buffer.slice(0, nextBoundary).trim();
          buffer = buffer.slice(nextBoundary + 1);
          if (nextLine.startsWith("data:")) {
            try {
              truncatedData = JSON.parse(nextLine.replace("data: ", ""));
            } catch (e) {
              console.log(e);
            }
          }
        }
        if (truncatedData && truncatedData.truncated) {
          onMessage && onMessage(null, { truncated: true });
        }
      }
    }
  }
};
