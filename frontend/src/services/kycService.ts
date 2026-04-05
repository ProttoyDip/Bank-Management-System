import api from "./api";
import { ApiResponse, KycRequest } from "../types";

export interface KycSubmissionPayload {
  fullName: string;
  dob: string;
  address: string;
  nationalId?: string;
  passportNumber?: string;
  country: string;
  transactionIntent: string;
  idDocument: {
    name: string;
    dataUrl: string;
  };
  addressDocument: {
    name: string;
    dataUrl: string;
  };
}

const KYC_CACHE_MS = 5 * 60 * 1000;
let cachedKyc: KycRequest | null | undefined = undefined;
let cachedKycTimestamp = 0;
let pendingKycRequest: Promise<KycRequest | null> | null = null;

const getCachedKyc = (): KycRequest | null | undefined => {
  if (cachedKycTimestamp && Date.now() - cachedKycTimestamp < KYC_CACHE_MS) {
    return cachedKyc ?? null;
  }
  return undefined;
};

export const kycService = {
  async getMyKyc(options: { forceRefresh?: boolean } = {}): Promise<KycRequest | null> {
    if (!options.forceRefresh) {
      const cached = getCachedKyc();
      if (cached !== undefined) {
        return cached;
      }
      if (pendingKycRequest) {
        return pendingKycRequest;
      }
    }

    pendingKycRequest = api
      .get<ApiResponse<KycRequest | null>>("/kyc/me")
      .then((response) => {
        cachedKyc = response.data.data || null;
        cachedKycTimestamp = Date.now();
        return cachedKyc;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        pendingKycRequest = null;
      });

    return pendingKycRequest;
  },

  async submitKyc(payload: KycSubmissionPayload): Promise<KycRequest> {
    const response = await api.post<ApiResponse<KycRequest>>("/kyc/submit", payload);
    cachedKyc = response.data.data || null;
    cachedKycTimestamp = Date.now();
    return response.data.data;
  },
};

export default kycService;

