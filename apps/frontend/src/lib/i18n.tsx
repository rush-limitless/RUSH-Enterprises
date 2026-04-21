"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const t = {
  fr: {
    dashboard: "Tableau de bord", inventory: "Inventaire", sales: "Ventes", purchases: "Achats",
    integrations: "Intégrations", channels: "Canaux actifs", reports: "Rapports", documents: "Documents",
    search: "Rechercher", salesActivity: "Activité des ventes", toBePacked: "À EMBALLER",
    toBeShipped: "À EXPÉDIER", toBeDelivered: "À LIVRER", toBeInvoiced: "À FACTURER",
    inventorySummary: "Résumé inventaire", qtyInHand: "Quantité en stock", qtyToReceive: "Quantité à recevoir",
    productDetails: "Détails produits", lowStockItems: "Stock faible", allItemGroup: "Groupes d'articles",
    allItems: "Tous les articles", activeItems: "Articles actifs", topSelling: "Meilleures ventes",
    previousYear: "Année précédente", purchaseOrder: "Bon de commande", thisMonth: "Ce mois",
    qtyOrdered: "Quantité commandée", salesOrder: "Commandes de vente",
    channel: "Canal", draft: "Brouillon", confirmed: "Confirmé", packed: "Emballé", shipped: "Expédié",
    directSales: "Ventes directes", allItemsTitle: "Tous les articles", newItem: "Nouvel article",
    searchItems: "Rechercher des articles...", name: "Nom", category: "Catégorie", type: "Type",
    price: "Prix", stock: "Stock", physical: "Physique", digital: "Numérique", create: "Créer",
    noItems: "Aucun article trouvé", cashRegister: "Caisse", openRegister: "Ouvrir la caisse",
    openingBalance: "Solde d'ouverture", open: "Ouvrir", opening: "Ouverture", currentBalance: "Solde actuel",
    transactions: "Transactions", newTransaction: "Nouvelle transaction", amount: "Montant",
    description: "Description", optional: "Optionnel", sale: "Vente", expense: "Dépense",
    cancel: "Annuler", closeRegister: "Fermer la caisse", theoretical: "Théorique",
    actualBalance: "Solde réel", gap: "Écart", confirmClose: "Confirmer la fermeture",
    purchaseOrders: "Bons de commande", newTask: "Nouvelle tâche", searchTasks: "Rechercher des tâches...",
    title: "Titre", dueDate: "Échéance", status: "Statut", done: "Terminé", pending: "En cours",
    overdue: "En retard", noTasks: "Aucune tâche trouvée",
    reportsTitle: "Rapports", salesReport: "Rapport des ventes", productReport: "Rapport produits",
    alertsReport: "Alertes stock", totalRevenue: "Chiffre d'affaires", totalExpenses: "Total dépenses",
    avgBasket: "Panier moyen", discounts: "Remises", caBreakdown: "Répartition C.A.",
    products: "Produits", services: "Services", loading: "Chargement…", fcfa: "FCFA",
    pcs: "pcs", noData: "Aucune donnée",
  },
  en: {
    dashboard: "Dashboard", inventory: "Inventory", sales: "Sales", purchases: "Purchases",
    integrations: "Integrations", channels: "Active Channels", reports: "Reports", documents: "Documents",
    search: "Search", salesActivity: "Sales Activity", toBePacked: "TO BE PACKED",
    toBeShipped: "TO BE SHIPPED", toBeDelivered: "TO BE DELIVERED", toBeInvoiced: "TO BE INVOICED",
    inventorySummary: "Inventory Summary", qtyInHand: "Quantity in Hand", qtyToReceive: "Quantity to be Received",
    productDetails: "Product Details", lowStockItems: "Low Stock Items", allItemGroup: "All Item Group",
    allItems: "All Items", activeItems: "Active Items", topSelling: "Top Selling Items",
    previousYear: "Previous Year", purchaseOrder: "Purchase Order", thisMonth: "This Month",
    qtyOrdered: "Quantity Ordered", salesOrder: "Sales Order",
    channel: "Channel", draft: "Draft", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped",
    directSales: "Direct sales", allItemsTitle: "All Items", newItem: "New Item",
    searchItems: "Search items...", name: "Name", category: "Category", type: "Type",
    price: "Price", stock: "Stock", physical: "Physical", digital: "Digital", create: "Create",
    noItems: "No items found", cashRegister: "Cash Register", openRegister: "Open Register",
    openingBalance: "Opening Balance", open: "Open", opening: "Opening", currentBalance: "Current Balance",
    transactions: "Transactions", newTransaction: "New Transaction", amount: "Amount",
    description: "Description", optional: "Optional", sale: "Sale", expense: "Expense",
    cancel: "Cancel", closeRegister: "Close Register", theoretical: "Theoretical",
    actualBalance: "Actual Balance", gap: "Gap", confirmClose: "Confirm Close",
    purchaseOrders: "Purchase Orders", newTask: "New Task", searchTasks: "Search tasks...",
    title: "Title", dueDate: "Due Date", status: "Status", done: "Done", pending: "Pending",
    overdue: "Overdue", noTasks: "No tasks found",
    reportsTitle: "Reports", salesReport: "Sales Report", productReport: "Product Report",
    alertsReport: "Stock Alerts", totalRevenue: "Total Revenue", totalExpenses: "Total Expenses",
    avgBasket: "Avg Basket", discounts: "Discounts", caBreakdown: "Revenue Breakdown",
    products: "Products", services: "Services", loading: "Loading…", fcfa: "FCFA",
    pcs: "pcs", noData: "No data",
  },
} as const;

type Lang = "fr" | "en";
type Translations = Record<string, string>;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Translations }>({
  lang: "fr", setLang: () => {}, t: t.fr,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  return <LangContext.Provider value={{ lang, setLang, t: t[lang] as unknown as Translations }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
