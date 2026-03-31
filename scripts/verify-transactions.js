/* eslint-disable no-console */
require("dotenv").config();

const BASE_URL = process.env.VERIFY_BASE_URL || "http://localhost:3000/api";
const TEST_EMAIL = process.env.VERIFY_EMAIL || "rahim@example.com";
const TEST_PASSWORD = process.env.VERIFY_PASSWORD || "password123";
const AUTO_SEED = String(process.env.VERIFY_AUTO_SEED || "true").toLowerCase() === "true";

const asNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Expected numeric value, got: ${value}`);
  }
  return n;
};

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const detail = typeof data === "string" ? data : data?.error || JSON.stringify(data);
    throw new Error(`${method} ${path} failed (${res.status}): ${detail}`);
  }
  return data;
}

async function trySeedUsers() {
  if (!AUTO_SEED) return;
  try {
    await request("/seed/seed-users", { method: "POST" });
    console.log("Seed step: users seeded/reset.");
  } catch (err) {
    console.warn(`Seed step skipped: ${err.message}`);
  }
}

async function login() {
  const data = await request("/users/login", {
    method: "POST",
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  if (!data?.token || !data?.user?.id) {
    throw new Error("Login response missing token or user.");
  }
  return data;
}

async function ensureAccounts(userId, token) {
  let accountsRes = await request(`/accounts/user/${userId}`, { token });
  let accounts = accountsRes?.data || [];

  while (accounts.length < 2) {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const accountNumber = suffix.slice(-12);
    await request("/accounts", {
      method: "POST",
      token,
      body: { userId, accountNumber, balance: 0 },
    });
    accountsRes = await request(`/accounts/user/${userId}`, { token });
    accounts = accountsRes?.data || [];
  }

  return accounts.slice(0, 2);
}

async function getAccount(id, token) {
  const data = await request(`/accounts/${id}`, { token });
  return data?.data;
}

async function getAccountTransactions(accountId, token) {
  const data = await request(`/transactions/account/${accountId}`, { token });
  return data?.data || [];
}

async function getUserTransactions(userId, token) {
  const data = await request(`/transactions/user/${userId}?limit=50`, { token });
  return data?.data || [];
}

async function run() {
  console.log(`Running transaction verifier against: ${BASE_URL}`);
  await trySeedUsers();

  const auth = await login();
  const token = auth.token;
  const userId = auth.user.id;

  console.log(`Logged in as user #${userId} (${auth.user.email})`);

  const [accountA, accountB] = await ensureAccounts(userId, token);
  console.log(`Using accounts: A=${accountA.id}, B=${accountB.id}`);

  const beforeA = asNumber((await getAccount(accountA.id, token)).balance);
  const beforeB = asNumber((await getAccount(accountB.id, token)).balance);

  const depositAmount = 100;
  const withdrawAmount = 40;
  const transferAmount = 30;

  const depositRes = await request(`/accounts/${accountA.id}/deposit`, {
    method: "POST",
    token,
    body: { amount: depositAmount, description: "verify: deposit check" },
  });
  const afterDepositA = asNumber((await getAccount(accountA.id, token)).balance);
  if (afterDepositA !== beforeA + depositAmount) {
    throw new Error(`Deposit mismatch: expected ${beforeA + depositAmount}, got ${afterDepositA}`);
  }
  console.log("Deposit check passed.");

  await request(`/accounts/${accountA.id}/withdraw`, {
    method: "POST",
    token,
    body: { amount: withdrawAmount, description: "verify: withdraw check" },
  });
  const afterWithdrawA = asNumber((await getAccount(accountA.id, token)).balance);
  if (afterWithdrawA !== afterDepositA - withdrawAmount) {
    throw new Error(`Withdraw mismatch: expected ${afterDepositA - withdrawAmount}, got ${afterWithdrawA}`);
  }
  console.log("Withdraw check passed.");

  await request("/accounts/transfer", {
    method: "POST",
    token,
    body: {
      fromAccountId: accountA.id,
      toAccountId: accountB.id,
      amount: transferAmount,
      description: "verify: transfer check",
    },
  });

  const afterTransferA = asNumber((await getAccount(accountA.id, token)).balance);
  const afterTransferB = asNumber((await getAccount(accountB.id, token)).balance);
  if (afterTransferA !== afterWithdrawA - transferAmount) {
    throw new Error(`Transfer source mismatch: expected ${afterWithdrawA - transferAmount}, got ${afterTransferA}`);
  }
  if (afterTransferB !== beforeB + transferAmount) {
    throw new Error(`Transfer destination mismatch: expected ${beforeB + transferAmount}, got ${afterTransferB}`);
  }
  console.log("Transfer balance checks passed.");

  const accountTx = await getAccountTransactions(accountA.id, token);
  const userTx = await getUserTransactions(userId, token);
  const txRef = depositRes?.transaction?.referenceNumber;
  if (!txRef || !accountTx.some((tx) => tx.referenceNumber === txRef) || !userTx.some((tx) => tx.referenceNumber === txRef)) {
    throw new Error("Transaction retrieval mismatch: deposit transaction not found in account/user transaction history.");
  }
  console.log("Transaction retrieval checks passed.");

  console.log("All transaction verification checks passed.");
}

run().catch((error) => {
  console.error(`Verification failed: ${error.message}`);
  process.exit(1);
});
