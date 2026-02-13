import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type Lang = "en" | "hi" | "gu";

type Translations = Record<string, Record<Lang, string>>;

const T: Translations = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", gu: "ડેશબોર્ડ" },
  "nav.sales": { en: "Sales", hi: "बिक्री", gu: "વેચાણ" },
  "nav.inventory": { en: "Inventory", hi: "इन्वेंट्री", gu: "ઇન્વેન્ટરી" },
  "nav.reports": { en: "Reports", hi: "रिपोर्ट", gu: "રિપોર્ટ" },
  "nav.more": { en: "More", hi: "और", gu: "વધુ" },
  "nav.customers": { en: "Customers", hi: "ग्राहक", gu: "ગ્રાહકો" },
  "nav.purchases": { en: "Purchases", hi: "खरीदारी", gu: "ખરીદી" },
  "nav.expenses": { en: "Expenses", hi: "खर्चे", gu: "ખર્ચ" },
  "nav.onlineStore": { en: "Online Store", hi: "ऑनलाइन स्टोर", gu: "ઓનલાઇન સ્ટોર" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स", gu: "સેટિંગ્સ" },

  // Dashboard
  "dash.commandCenter": { en: "Command Center", hi: "कमांड सेंटर", gu: "કમાન્ડ સેન્ટર" },
  "dash.todaySales": { en: "Today Sales", hi: "आज की बिक्री", gu: "આજનું વેચાણ" },
  "dash.todayProfit": { en: "Today Profit", hi: "आज का लाभ", gu: "આજનો નફો" },
  "dash.stockItems": { en: "Stock Items", hi: "स्टॉक आइटम", gu: "સ્ટોક આઈટમ" },
  "dash.cashInHand": { en: "Outstanding", hi: "बकाया राशि", gu: "બાકી રકમ" },
  "dash.pendingInvoices": { en: "Pending Bills", hi: "लंबित बिल", gu: "બાકી બિલ" },
  "dash.quickActions": { en: "Quick Actions", hi: "त्वरित कार्य", gu: "ઝડપી ક્રિયાઓ" },
  "dash.quickSell": { en: "Quick Sell", hi: "तेज़ बिल", gu: "ઝડપી બિલ" },
  "dash.addStock": { en: "Add Stock", hi: "स्टॉक जोड़ें", gu: "સ્ટોક ઉમેરો" },
  "dash.recentSales": { en: "Recent Sales", hi: "हाल की बिक्री", gu: "તાજેતરનું વેચાણ" },
  "dash.lowStock": { en: "Low Stock", hi: "कम स्टॉक", gu: "ઓછો સ્ટોક" },
  "dash.revenueOverview": { en: "Revenue Overview", hi: "राजस्व अवलोकन", gu: "આવક ઝાંખી" },
  "dash.viewAll": { en: "View All", hi: "सब देखें", gu: "બધું જુઓ" },
  "dash.details": { en: "Details", hi: "विवरण", gu: "વિગતો" },

  // Sales
  "sales.title": { en: "Sales & Billing", hi: "बिक्री और बिलिंग", gu: "વેચાણ અને બિલિંગ" },
  "sales.subtitle": { en: "Create fast bills", hi: "तेज़ बिल बनाएं", gu: "ઝડપી બિલ બનાવો" },
  "sales.quickSellBtn": { en: "Quick Sell", hi: "तेज़ बिल बनाएं", gu: "ઝડપી બિલ બનાવો" },
  "sales.invoices": { en: "Invoices", hi: "चालान", gu: "ઇન્વોઇસ" },
  "sales.avgSale": { en: "Avg Sale", hi: "औसत बिक्री", gu: "સરેરાશ વેચાણ" },
  "sales.recentInvoices": { en: "Recent Invoices", hi: "हाल के चालान", gu: "તાજેતરના ઇન્વોઇસ" },
  "sales.searchInvoices": { en: "Search invoices...", hi: "चालान खोजें...", gu: "ઇન્વોઇસ શોધો..." },

  // Inventory
  "inv.title": { en: "Inventory", hi: "इन्वेंट्री", gu: "ઇન્વેન્ટરી" },
  "inv.subtitle": { en: "Stock Management", hi: "स्टॉक प्रबंधन", gu: "સ્ટોક મેનેજમેન્ટ" },
  "inv.searchProducts": { en: "Search products...", hi: "उत्पाद खोजें...", gu: "ઉત્પાદનો શોધો..." },
  "inv.totalItems": { en: "Total Items", hi: "कुल आइटम", gu: "કુલ આઈટમ" },
  "inv.lowStock": { en: "Low Stock", hi: "कम स्टॉक", gu: "ઓછો સ્ટોક" },
  "inv.value": { en: "Value", hi: "मूल्य", gu: "કિંમત" },
  "inv.products": { en: "Products", hi: "उत्पाद", gu: "ઉત્પાદનો" },
  "inv.newProduct": { en: "New Product", hi: "नया उत्पाद", gu: "નવું ઉત્પાદન" },
  "inv.productName": { en: "Product name *", hi: "उत्पाद का नाम *", gu: "ઉત્પાદનનું નામ *" },
  "inv.skuCode": { en: "SKU code *", hi: "SKU कोड *", gu: "SKU કોડ *" },
  "inv.price": { en: "Price (₹) *", hi: "कीमत (₹) *", gu: "કિંમત (₹) *" },
  "inv.stockQty": { en: "Stock qty *", hi: "स्टॉक मात्रा *", gu: "સ્ટોક જથ્થો *" },
  "inv.saveProduct": { en: "Save Product", hi: "उत्पाद सहेजें", gu: "ઉત્પાદન સાચવો" },
  "inv.inStock": { en: "in stock", hi: "स्टॉक में", gu: "સ્ટોકમાં" },

  // Customers
  "cust.title": { en: "Customers", hi: "ग्राहक", gu: "ગ્રાહકો" },
  "cust.subtitle": { en: "CRM & Contacts", hi: "CRM और संपर्क", gu: "CRM અને સંપર્ક" },
  "cust.search": { en: "Search customers...", hi: "ग्राहक खोजें...", gu: "ગ્રાહકો શોધો..." },
  "cust.total": { en: "Total Customers", hi: "कुल ग्राहक", gu: "કુલ ગ્રાહકો" },
  "cust.outstanding": { en: "Outstanding", hi: "बकाया", gu: "બાકી" },
  "cust.newCustomer": { en: "New Customer", hi: "नया ग्राहक", gu: "નવો ગ્રાહક" },
  "cust.name": { en: "Customer name *", hi: "ग्राहक का नाम *", gu: "ગ્રાહકનું નામ *" },
  "cust.phone": { en: "Phone number *", hi: "फ़ोन नंबर *", gu: "ફોન નંબર *" },
  "cust.balance": { en: "Balance (₹)", hi: "बकाया (₹)", gu: "બેલેન્સ (₹)" },
  "cust.save": { en: "Save Customer", hi: "ग्राहक सहेजें", gu: "ગ્રાહક સાચવો" },
  "cust.due": { en: "due", hi: "बकाया", gu: "બાકી" },
  "cust.call": { en: "Call", hi: "कॉल", gu: "કૉલ" },

  // Quick Bill
  "bill.title": { en: "Quick Bill", hi: "तेज़ बिल", gu: "ઝડપી બિલ" },
  "bill.step": { en: "Step", hi: "चरण", gu: "પગલું" },
  "bill.scanBarcode": { en: "Scan barcode / SKU...", hi: "बारकोड / SKU स्कैन करें...", gu: "બારકોડ / SKU સ્કેન કરો..." },
  "bill.searchProducts": { en: "Search products...", hi: "उत्पाद खोजें...", gu: "ઉત્પાદનો શોધો..." },
  "bill.cart": { en: "Cart", hi: "कार्ट", gu: "કાર્ટ" },
  "bill.reviewGst": { en: "Review & GST", hi: "समीक्षा और GST", gu: "સમીક્ષા અને GST" },
  "bill.previewInvoice": { en: "Preview Invoice", hi: "चालान देखें", gu: "ઇન્વોઇસ જુઓ" },
  "bill.customerName": { en: "Customer Name", hi: "ग्राहक का नाम", gu: "ગ્રાહકનું નામ" },
  "bill.phoneNumber": { en: "Phone Number", hi: "फ़ोन नंबर", gu: "ફોન નંબર" },
  "bill.subtotal": { en: "Subtotal", hi: "उप-योग", gu: "પેટા-સરવાળો" },
  "bill.total": { en: "Total", hi: "कुल", gu: "કુલ" },
  "bill.billTo": { en: "Bill To:", hi: "बिल:", gu: "બિલ:" },
  "bill.done": { en: "Done", hi: "बिल पूरा", gu: "બિલ પૂર્ણ" },
  "bill.billCreated": { en: "Bill Created!", hi: "बिल बन गया!", gu: "બિલ બની ગયું!" },
  "bill.back": { en: "Back", hi: "वापस", gu: "પાછા" },
  "bill.whatsapp": { en: "WhatsApp", hi: "WhatsApp", gu: "WhatsApp" },
  "bill.printPdf": { en: "Print / PDF", hi: "प्रिंट / PDF", gu: "પ્રિન્ટ / PDF" },

  // More page
  "more.title": { en: "More", hi: "और", gu: "વધુ" },
  "more.subtitle": { en: "All modules", hi: "सभी मॉड्यूल", gu: "બધા મોડ્યુલ" },
  "more.supplierOrders": { en: "Supplier orders", hi: "आपूर्तिकर्ता ऑर्डर", gu: "સપ્લાયર ઓર્ડર" },
  "more.trackSpending": { en: "Track spending", hi: "खर्च ट्रैक करें", gu: "ખર્ચ ટ્રેક કરો" },
  "more.crmContacts": { en: "CRM & contacts", hi: "CRM और संपर्क", gu: "CRM અને સંપર્ક" },
  "more.miniStore": { en: "Mini store link", hi: "मिनी स्टोर लिंक", gu: "મિની સ્ટોર લિંક" },
  "more.configuration": { en: "Configuration", hi: "कॉन्फ़िगरेशन", gu: "રૂપરેખાંકન" },

  // Common
  "common.search": { en: "Search", hi: "खोजें", gu: "શોધો" },
  "common.save": { en: "Save", hi: "सहेजें", gu: "સાચવો" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें", gu: "રદ કરો" },
  "common.language": { en: "Language", hi: "भाषा", gu: "ભાષા" },
  "common.theme": { en: "Theme", hi: "थीम", gu: "થીમ" },
  "common.dark": { en: "Dark", hi: "डार्क", gu: "ડાર્ક" },
  "common.light": { en: "Light", hi: "लाइट", gu: "લાઇટ" },
  "common.voice": { en: "Voice", hi: "आवाज़", gu: "અવાજ" },
  "common.listening": { en: "Listening...", hi: "सुन रहा है...", gu: "સાંભળી રહ્યું છે..." },

  // Purchases
  "purch.title": { en: "Purchases", hi: "खरीदारी", gu: "ખરીદી" },
  "purch.subtitle": { en: "Supplier Management", hi: "आपूर्तिकर्ता प्रबंधन", gu: "સપ્લાયર મેનેજમેન્ટ" },
  "purch.newPO": { en: "New Purchase Order", hi: "नया खरीद आदेश", gu: "નવો ખરીદી ઓર્ડર" },
  "purch.thisMonth": { en: "This Month", hi: "इस महीने", gu: "આ મહિને" },
  "purch.pendingPOs": { en: "Pending POs", hi: "लंबित POs", gu: "બાકી POs" },
  "purch.recentOrders": { en: "Recent Orders", hi: "हाल के ऑर्डर", gu: "તાજેતરના ઓર્ડર" },

  // Expenses
  "exp.title": { en: "Expenses", hi: "खर्चे", gu: "ખર્ચ" },
  "exp.subtitle": { en: "Track daily expenses", hi: "दैनिक खर्च ट्रैक करें", gu: "દૈનિક ખર્ચ ટ્રેક કરો" },
  "exp.addExpense": { en: "Add Expense", hi: "खर्च जोड़ें", gu: "ખર્ચ ઉમેરો" },
  "exp.thisMonth": { en: "This Month", hi: "इस महीने", gu: "આ મહિને" },
  "exp.today": { en: "Today", hi: "आज", gu: "આજે" },
  "exp.recent": { en: "Recent Expenses", hi: "हाल के खर्चे", gu: "તાજેતરના ખર્ચ" },
  "exp.recurring": { en: "Recurring", hi: "आवर्ती", gu: "પુનરાવર્તી" },
};

interface I18nContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nCtx = createContext<I18nContext>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("umiya_lang") as Lang) || "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("umiya_lang", l);
  }, []);

  const t = useCallback(
    (key: string) => T[key]?.[lang] ?? T[key]?.en ?? key,
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : lang === "gu" ? "gu" : "en";
  }, [lang]);

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
