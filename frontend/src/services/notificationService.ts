import api from "./api";
import { Notification, NotificationType } from "../types";

// ================= UTILITIES =================

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
  async getCustomerNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await api.get(`/transactions/user/${userId}?limit=5`);
      const transactions = response.data.data || response.data || [];

      return transactions.map((tx: any, index: number) => {
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
      const loansResponse = await api.get("/loans?status=Pending");
      const pendingLoans = loansResponse.data.data || loansResponse.data || [];

      const usersResponse = await api.get("/users");
      const users = usersResponse.data.data || usersResponse.data || [];

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