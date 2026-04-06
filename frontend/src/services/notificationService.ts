import api from "./api";
import { Notification, NotificationType } from "../types";
import kycService from "./kycService";

// ================= CACHE =================
let adminKycCache: { data: any[]; timestamp: number } | null = null;
const ADMIN_KYC_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 💰 Format currency (BDT - Taka)
const formatCurrency = (amount: number) => {
  return `৳ ${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// 🔐 Mask account number
const maskAccount = (acc?: string) => {
  if (!acc) return "****XXXX";
  return `****${acc.slice(-4)}`;
};

// ================= SERVICE =================

export const notificationService = {
  // ================= CUSTOMER =================
  async getCustomerNotifications(userId: number, options: { skipKyc?: boolean } = {}): Promise<Notification[]> {
    try {
      const transactionPromise = api.get(`/transactions/user/${userId}?limit=5`);
      const kycPromise = options.skipKyc ? Promise.resolve(null) : kycService.getMyKyc();
      const [txResult, kycResult] = await Promise.allSettled([transactionPromise, kycPromise]) as any[];
      const kycRequest = kycResult?.status === 'fulfilled' ? kycResult.value : null;
      const transactions = txResult.status === 'fulfilled'
        ? txResult.value.data.data || txResult.value.data || []
        : [];
      const notifications = transactions.map((tx: any, index: number) => {
        const accountNumber = maskAccount(tx.account?.accountNumber);
        const amount = formatCurrency(tx.amount);

        let message = "";

        switch (tx.type) {
          case "Deposit":
            message = `An amount of ${amount} has been successfully credited to your account ${accountNumber}.`;
            break;

          case "Withdraw":
            message = `A withdrawal of ${amount} has been processed from your account ${accountNumber}.`;
            break;

          case "Transfer In":
            message = `You have received ${amount} in your account ${accountNumber}.`;
            break;

          case "Transfer Out":
            message = `A transfer of ${amount} has been made from your account ${accountNumber}.`;
            break;

          case "Loan Disbursement":
            message = `Your loan amount of ${amount} has been successfully disbursed to account ${accountNumber}.`;
            break;

          case "Loan Payment":
            message = `Your loan repayment of ${amount} has been received successfully.`;
            break;

          default:
            message = `A transaction of ${amount} has been recorded on your account ${accountNumber}.`;
        }

        return {
          id: tx.id || index,
          title: getTransactionTitle(tx.type),
          message,
          type: NotificationType.TRANSACTION,
          transactionId: tx.id,
          isRead: false,
          createdAt: tx.createdAt || new Date().toISOString(),
        };
      });

      if (kycRequest) {
        notifications.unshift({
          id: Number(kycRequest.id) || 9000,
          title: `KYC ${kycRequest.status || "Update"}`,
          message: kycRequest.status === "Verified"
            ? "Your KYC has been approved. All banking services are now available."
            : kycRequest.status === "Rejected"
              ? `Your KYC was rejected. ${kycRequest.remarks || "Please review the remarks and resubmit."}`
              : "Your KYC submission is awaiting review.",
          type: NotificationType.SYSTEM,
          isRead: false,
          createdAt: kycRequest.updatedAt || kycRequest.createdAt || new Date().toISOString(),
        });
      }

      return notifications;
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      return getDefaultCustomerNotifications();
    }
  },

  // ================= EMPLOYEE =================
  async getEmployeeNotifications(): Promise<Notification[]> {
    try {
      const loansResponse = await api.get("/loans?status=Pending");
      const pendingLoans = loansResponse.data.data || loansResponse.data || [];

      const accountsResponse = await api.get("/accounts?isActive=true");
      const accounts = accountsResponse.data.data || accountsResponse.data || [];

      const notifications: Notification[] = [];

      // Loan notifications
      pendingLoans.slice(0, 3).forEach((loan: any, index: number) => {
        notifications.push({
          id: loan.id || index + 1000,
          title: "Loan Approval Required",
          message: `A ${loan.type} loan request of ${formatCurrency(
            loan.amount
          )} is currently pending approval.`,
          type: NotificationType.LOAN,
          isRead: false,
          createdAt: loan.createdAt || new Date().toISOString(),
        });
      });

      // Account notifications
      accounts.slice(0, 2).forEach((account: any, index: number) => {
        notifications.push({
          id: account.id || index + 2000,
          title: "New Account Registration",
          message: `A new ${account.type} account (${maskAccount(
            account.accountNumber
          )}) has been successfully created.`,
          type: NotificationType.ACCOUNT,
          isRead: false,
          createdAt: account.createdAt || new Date().toISOString(),
        });
      });

      return notifications;
    } catch (error) {
      console.error("Error fetching employee notifications:", error);
      return getDefaultEmployeeNotifications();
    }
  },

  // ================= ADMIN =================
  async getAdminNotifications(): Promise<Notification[]> {
    try {
      // Check cache for KYC data
      const now = Date.now();
      const kycPromise = adminKycCache && (now - adminKycCache.timestamp) < ADMIN_KYC_CACHE_DURATION
        ? Promise.resolve({ data: { data: adminKycCache.data } })
        : api.get("/admin/kyc?status=Pending&limit=5");

      const [loansResponse, usersResponse, kycResponse] = await Promise.all([
        api.get("/loans?status=Pending"),
        api.get("/users"),
        kycPromise,
      ]);

      const pendingLoans = loansResponse.data.data || loansResponse.data || [];
      const users = usersResponse.data.data || usersResponse.data || [];
      const pendingKyc = kycResponse.data.data || [];

      // Update cache if we made a fresh request
      if (!adminKycCache || (now - adminKycCache.timestamp) >= ADMIN_KYC_CACHE_DURATION) {
        adminKycCache = { data: pendingKyc, timestamp: now };
      }

      const notifications: Notification[] = [];

      // Loan notifications
      pendingLoans.slice(0, 3).forEach((loan: any, index: number) => {
        notifications.push({
          id: loan.id || index + 1000,
          title: "Loan Review Required",
          message: `A ${loan.type} loan application of ${formatCurrency(
            loan.amount
          )} requires administrative review.`,
          type: NotificationType.LOAN,
          isRead: false,
          createdAt: loan.createdAt || new Date().toISOString(),
        });
      });

      // System notification
      if (users.length > 0) {
        notifications.push({
          id: 9999,
          title: "System Status Update",
          message: `All banking services are operating normally. Total registered users: ${users.length}.`,
          type: NotificationType.SYSTEM,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      pendingKyc.slice(0, 5).forEach((kyc: any, index: number) => {
        notifications.push({
          id: Number(kyc.id) || index + 3000,
          title: "KYC Review Required",
          message: `${kyc.fullName || kyc.user?.name || "A customer"} submitted a KYC request that needs review.`,
          type: NotificationType.WARNING,
          isRead: false,
          createdAt: kyc.createdAt || new Date().toISOString(),
        });
      });

      return notifications;
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      return getDefaultAdminNotifications();
    }
  },
};

// ================= TITLES =================
function getTransactionTitle(type: string): string {
  switch (type) {
    case "Deposit":
      return "Deposit Successful";
    case "Withdraw":
      return "Withdrawal Successful";
    case "Transfer In":
      return "Funds Received";
    case "Transfer Out":
      return "Funds Transferred";
    case "Loan Disbursement":
      return "Loan Disbursed";
    case "Loan Payment":
      return "Loan Payment Received";
    default:
      return "Transaction Alert";
  }
}

// ================= DEFAULT FALLBACK =================
function getDefaultCustomerNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "Welcome to Digital Banking",
      message:
        "Your account has been successfully activated. You can now access all banking services.",
      type: NotificationType.SYSTEM,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultEmployeeNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "Loan Processing",
      message: "Pending loan applications require your attention.",
      type: NotificationType.LOAN,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Account Monitoring",
      message: "Newly created accounts should be reviewed.",
      type: NotificationType.ACCOUNT,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultAdminNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "System Monitoring",
      message: "All systems are functioning within normal parameters.",
      type: NotificationType.SYSTEM,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Pending Approvals",
      message: "Loan applications are awaiting administrative review.",
      type: NotificationType.LOAN,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export default notificationService;

export function connectNotificationStream(
  onNotification: (notification: Notification) => void
): () => void {
  if (typeof window === "undefined" || !("EventSource" in window)) {
    return () => undefined;
  }

  const source = new EventSource("/api/notifications/stream");

  source.addEventListener("notification", (event) => {
    const payload = JSON.parse((event as MessageEvent).data) as Notification;
    onNotification(payload);
  });

  source.onerror = () => {
    // The browser will retry automatically; keep the connection open.
  };

  return () => source.close();
}
