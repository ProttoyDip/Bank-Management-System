import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let globalRateLimitUntil = 0;
const pendingGetRequests = new Map<string, Promise<any>>();

const getRequestKey = (config: any) => {
  const url = config.url || "";
  const params = config.params ? JSON.stringify(config.params) : "";
  const data = config.data ? JSON.stringify(config.data) : "";
  const method = (config.method || "get").toLowerCase();
  return `${method}:${url}:${params}:${data}`;
};

const createClientRateLimitError = (config: any) => {
  const error = new Error("Client-side rate limit active. Please wait before retrying.") as any;
  error.config = config;
  error.response = {
    status: 429,
    statusText: "Too Many Requests",
    data: { message: "Client-side rate limit active. Please wait before retrying." },
  };
  error._clientRateLimited = true;
  return error;
};

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const requestConfig = config as any;
    if (Date.now() < globalRateLimitUntil && !requestConfig._bypassRateLimitLock) {
      const delay = Math.max(0, globalRateLimitUntil - Date.now());
      return new Promise((resolve) => setTimeout(() => resolve(config), delay));
    }

    const token = localStorage.getItem("token");
    config.withCredentials = true;
    if (token) {
      const headers = config.headers ?? {};

      if (typeof (headers as any).set === "function") {
        (headers as any).set("Authorization", `Bearer ${token}`);
      } else {
        (headers as any).Authorization = `Bearer ${token}`;
      }

      config.headers = headers;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MIN_RETRY_MS = 5000;
const MAX_RETRY_MS = 15000;

const parseRetryAfter = (header: string | undefined): number | undefined => {
  if (!header) return undefined;
  const numeric = Number(header);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return numeric;
  }
  const parsedDate = Date.parse(header);
  if (!Number.isNaN(parsedDate)) {
    const seconds = Math.ceil((parsedDate - Date.now()) / 1000);
    return seconds > 0 ? seconds : undefined;
  }
  return undefined;
};

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 handling
    const isLoginEndpoint = originalRequest?.url?.includes('/users/login') || originalRequest?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if ((error as any)._clientRateLimited) {
      return Promise.reject(error);
    }

    // 429 handling: short automatic retry only for brief server backoff.
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers?.['retry-after'];
      const retryAfterSeconds = parseRetryAfter(retryAfterHeader);
      const waitTime = retryAfterSeconds && retryAfterSeconds > 0
        ? Math.min(retryAfterSeconds * 1000, MAX_RETRY_MS)
        : Math.min(1000 * Math.pow(2, (originalRequest._retryCount || 0)), MAX_RETRY_MS);

      globalRateLimitUntil = Date.now() + Math.max(waitTime, MIN_RETRY_MS);
      console.warn(`Rate limited. Backing off for ${Math.round(waitTime / 1000)}s.`);

      const shouldAutoRetry = waitTime <= 5000;
      if (shouldAutoRetry && (originalRequest._retryCount || 0) < 1) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        originalRequest._bypassRateLimitLock = true;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

const CONCURRENT_REQUESTS = 4;
const REQUEST_SPACING_MS = 50;
let activeRequests = 0;
let lastRequestTimestamp = 0;
const requestQueue: Array<{ config: any; resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = () => {
  if (activeRequests >= CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const entry = requestQueue.shift()!;
  const delay = Math.max(0, REQUEST_SPACING_MS - (Date.now() - lastRequestTimestamp));

  setTimeout(async () => {
    activeRequests += 1;
    lastRequestTimestamp = Date.now();

    try {
      const result = await originalRequest(entry.config);
      entry.resolve(result);
    } catch (err) {
      entry.reject(err);
    } finally {
      activeRequests -= 1;
      processQueue();
    }
  }, delay);
};

const enqueueRequest = (config: any) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ config, resolve, reject });
    processQueue();
  });
};

const originalRequest = api.request.bind(api) as any;
api.request = async function (config: any) {
  const method = (config.method || "get").toLowerCase();
  if (method === "get") {
    const key = getRequestKey(config);
    if (pendingGetRequests.has(key)) {
      return pendingGetRequests.get(key);
    }
    const promise = enqueueRequest(config).finally(() => pendingGetRequests.delete(key));
    pendingGetRequests.set(key, promise);
    return promise;
  }
  return enqueueRequest(config);
} as any;

export default api;
