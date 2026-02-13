/**
 * Payment Service — Razorpay-ready abstraction layer.
 * 
 * Currently simulates all payment operations locally.
 * When Razorpay is connected, only this file needs to change:
 *   1. Replace `simulatePayment()` with Razorpay Checkout SDK
 *   2. Replace `createPaymentLink()` with Razorpay Payment Links API
 *   3. Add webhook handler edge function for payment.captured events
 * 
 * All UI components consume this interface — zero UI changes needed.
 */

// ── Types matching Razorpay's schema ──

export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "cash" | "link";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: "INR";
  receipt: string;
  status: "created" | "attempted" | "paid";
  customerName: string;
  customerPhone: string;
  createdAt: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  timestamp: number;
  error?: string;
}

export interface PaymentLink {
  id: string;
  shortUrl: string;
  amount: number;
  currency: "INR";
  description: string;
  customerName: string;
  customerPhone: string;
  invoiceId: string;
  status: "created" | "paid" | "expired" | "cancelled";
  expiresAt: number;
  createdAt: number;
}

export interface WebhookEvent {
  event: "payment.captured" | "payment.failed" | "payment_link.paid" | "payment_link.expired";
  payload: {
    paymentId: string;
    orderId?: string;
    linkId?: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
  };
  timestamp: number;
}

// ── Configuration ──

const RAZORPAY_READY = false; // Flip to true when API keys are configured

export function isRazorpayEnabled(): boolean {
  return RAZORPAY_READY;
}

// ── Razorpay Checkout SDK Loader ──

export function loadRazorpayCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout SDK"));
    document.head.appendChild(script);
  });
}

// ── Helpers ──

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

// ── Payment operations ──

/**
 * Create a payment order.
 * → Razorpay: POST /v1/orders
 */
export async function createOrder(params: {
  amount: number;
  receipt: string;
  customerName: string;
  customerPhone: string;
}): Promise<PaymentOrder> {
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: generateId("order"),
    amount: params.amount,
    currency: "INR",
    receipt: params.receipt,
    status: "created",
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    createdAt: Date.now(),
  };
}

/**
 * Process payment via checkout.
 * → Razorpay: Opens Razorpay Checkout modal with order_id
 */
export async function processPayment(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  method?: PaymentMethod;
}): Promise<PaymentResult> {
  if (RAZORPAY_READY) {
    // Load Razorpay Checkout SDK and open modal
    try {
      await loadRazorpayCheckout();
      // In production: configure Razorpay Checkout with order_id
      // For now, fall through to simulation
    } catch {
      console.warn("[PaymentService] Razorpay SDK load failed, falling back to simulation");
    }
  }

  // Simulate Razorpay Checkout flow
  await new Promise((r) => setTimeout(r, 1200));

  return {
    success: true,
    paymentId: generateId("pay"),
    orderId: params.orderId,
    method: params.method || "upi",
    amount: params.amount,
    status: "captured",
    timestamp: Date.now(),
  };
}

/**
 * Create a payment link for sharing.
 * → Razorpay: POST /v1/payment_links (via edge function)
 */
export async function createPaymentLink(params: {
  amount: number;
  description: string;
  customerName: string;
  customerPhone: string;
  invoiceId: string;
  expiryMinutes?: number;
}): Promise<PaymentLink> {
  if (RAZORPAY_READY) {
    // In production: call edge function that proxies to Razorpay API
    // const res = await fetch('/functions/v1/create-payment-link', { ... });
    // return res.json();
  }

  await new Promise((r) => setTimeout(r, 500));

  const linkId = generateId("plink");
  const expiresAt = Date.now() + (params.expiryMinutes || 10080) * 60 * 1000;

  return {
    id: linkId,
    shortUrl: `https://rzp.io/i/${linkId.slice(-8)}`,
    amount: params.amount,
    currency: "INR",
    description: params.description,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    invoiceId: params.invoiceId,
    status: "created",
    expiresAt,
    createdAt: Date.now(),
  };
}

/**
 * Check payment status.
 * → Razorpay: GET /v1/payments/:id (via edge function)
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentResult> {
  if (RAZORPAY_READY) {
    // In production: call edge function
    // const res = await fetch(`/functions/v1/check-payment?id=${paymentId}`);
    // return res.json();
  }

  await new Promise((r) => setTimeout(r, 200));

  return {
    success: true,
    paymentId,
    orderId: "",
    method: "upi",
    amount: 0,
    status: "captured",
    timestamp: Date.now(),
  };
}

/**
 * Simulate a webhook event (for testing UI state transitions).
 * → In production: handled by edge function receiving Razorpay webhook POST
 */
export function simulateWebhookEvent(
  event: WebhookEvent["event"],
  paymentId: string,
  amount: number,
): WebhookEvent {
  return {
    event,
    payload: {
      paymentId,
      amount,
      method: "upi",
      status: event.includes("captured") || event.includes("paid") ? "captured" : "failed",
    },
    timestamp: Date.now(),
  };
}
