/**
 * Every string the paywall shows, in the five languages the site's audience
 * reads: English, French, Portuguese (Brazilian), Spanish and German.
 *
 * "The paywall" is the path from hitting a limit to paying: the blurred
 * preview's unlock prompt, the upgrade dialog, the pass picker, and the
 * checkout button with its errors and notices (plus the item description
 * inside Razorpay's window). Most humanizer users read French or Portuguese
 * (GA4, Oct–Nov 2026), and this path used to be English-only.
 *
 * Prices are passed in already formatted (see lib/currency.js formatMoney), so
 * the sentences here never assume a currency or a number format.
 *
 * Adding a string: add it to every language. Missing keys fall back to
 * English (see getPaywallText), so a gap shows English rather than breaking.
 *
 * Tone: informal "tu"/"du"/"você" where natural for a student-heavy audience
 * (Spanish, German, Portuguese); "vous" in French, which is the norm for a
 * product talking to a stranger.
 */

export const PAYWALL_LANGS = ["en", "fr", "pt", "es", "de"];

const en = {
  // Upgrade dialog
  limitTitle: "You've hit your free limit",
  limitMessage: (runs, price, days) =>
    `You've used all ${runs} free runs. Get unlimited access from ${price} for ${days} days.`,
  genericMessage: "Remove the limits and keep going.",
  features: [
    "Unlimited humanizer runs — no daily cap",
    "No word limit per run",
    "One-time payment, nothing auto-renews",
  ],
  unlockCta: (price, days) => `Unlock Pro — ${price} for ${days} days`,
  comparePlans: "Compare plans",
  close: "Close",

  // Pass picker
  choosePass: "Choose a pass",
  days: (n) => `${n} days`,
  bestValue: "Best value",
  perDay: (price) => `${price} a day`,

  // Blurred preview
  previewSummary: (done, total) => `${done} of ${total} words humanized.`,
  previewPitch: (price, days) =>
    `Pro finishes this text, and gives you unlimited runs with no word limit — from ${price} for ${days} days.`,
  previewButton: (price) => `Unlock the rest — from ${price} →`,

  // After paying
  proActive: "You are Pro — no daily cap, no word limit.",

  // Checkout button
  getPro: (price, days) => `Get Pro — ${price} for ${days} days`,
  addDays: (days, price) => `Add ${days} days — ${price}`,
  opening: "Opening checkout…",
  checkoutItem: (days) => `Pro — ${days} days of unlimited access`,
  scriptBlocked: "Could not load the payment window. Check your connection or any ad blocker.",
  startFailed: "Could not start checkout. Please try again.",
  closedNotice: "Checkout closed — you have not been charged.",
  paymentFailed: "The payment did not go through.",
  verifyFailed: "We could not confirm your payment.",
  verifyPending:
    "Your payment went through, but activation is still finishing. Refresh your account page in a moment.",
  verifyUnreachable:
    "Your payment went through but we could not confirm it here. Refresh this page in a moment, or contact us if Pro is still not active.",
  genericError: "Something went wrong starting checkout. Please try again.",
};

const fr = {
  limitTitle: "Vous avez atteint la limite gratuite",
  limitMessage: (runs, price, days) =>
    `Vous avez utilisé vos ${runs} essais gratuits. Accès illimité à partir de ${price} pour ${days} jours.`,
  genericMessage: "Levez les limites et continuez.",
  features: [
    "Humanisations illimitées, sans plafond quotidien",
    "Aucune limite de mots par texte",
    "Paiement unique, sans renouvellement automatique",
  ],
  unlockCta: (price, days) => `Débloquer Pro — ${price} pour ${days} jours`,
  comparePlans: "Comparer les offres",
  close: "Fermer",

  choosePass: "Choisissez un pass",
  days: (n) => `${n} jours`,
  bestValue: "Meilleur prix",
  perDay: (price) => `${price} par jour`,

  previewSummary: (done, total) => `${done} mots humanisés sur ${total}.`,
  previewPitch: (price, days) =>
    `Pro termine ce texte et vous offre des humanisations illimitées, sans limite de mots — à partir de ${price} pour ${days} jours.`,
  previewButton: (price) => `Débloquer la suite — dès ${price} →`,

  proActive: "Vous êtes Pro — sans plafond quotidien, sans limite de mots.",

  getPro: (price, days) => `Passer à Pro — ${price} pour ${days} jours`,
  addDays: (days, price) => `Ajouter ${days} jours — ${price}`,
  opening: "Ouverture du paiement…",
  checkoutItem: (days) => `Pro — ${days} jours d'accès illimité`,
  scriptBlocked:
    "Impossible de charger la fenêtre de paiement. Vérifiez votre connexion ou votre bloqueur de publicités.",
  startFailed: "Impossible de lancer le paiement. Veuillez réessayer.",
  closedNotice: "Paiement fermé — aucun montant n'a été débité.",
  paymentFailed: "Le paiement n'a pas abouti.",
  verifyFailed: "Nous n'avons pas pu confirmer votre paiement.",
  verifyPending:
    "Votre paiement est passé, mais l'activation est en cours. Actualisez votre page de compte dans un instant.",
  verifyUnreachable:
    "Votre paiement est passé, mais nous n'avons pas pu le confirmer ici. Actualisez cette page dans un instant, ou contactez-nous si Pro n'est toujours pas actif.",
  genericError: "Une erreur est survenue au lancement du paiement. Veuillez réessayer.",
};

const pt = {
  limitTitle: "Você atingiu o limite gratuito",
  limitMessage: (runs, price, days) =>
    `Você usou suas ${runs} execuções gratuitas. Acesso ilimitado a partir de ${price} por ${days} dias.`,
  genericMessage: "Remova os limites e continue.",
  features: [
    "Humanizações ilimitadas, sem limite diário",
    "Sem limite de palavras por texto",
    "Pagamento único, sem renovação automática",
  ],
  unlockCta: (price, days) => `Desbloquear o Pro — ${price} por ${days} dias`,
  comparePlans: "Comparar planos",
  close: "Fechar",

  choosePass: "Escolha um passe",
  days: (n) => `${n} dias`,
  bestValue: "Melhor custo-benefício",
  perDay: (price) => `${price} por dia`,

  previewSummary: (done, total) => `${done} de ${total} palavras humanizadas.`,
  previewPitch: (price, days) =>
    `O Pro termina este texto e oferece humanizações ilimitadas, sem limite de palavras — a partir de ${price} por ${days} dias.`,
  previewButton: (price) => `Desbloquear o resto — a partir de ${price} →`,

  proActive: "Você é Pro — sem limite diário, sem limite de palavras.",

  getPro: (price, days) => `Obter o Pro — ${price} por ${days} dias`,
  addDays: (days, price) => `Adicionar ${days} dias — ${price}`,
  opening: "Abrindo o pagamento…",
  checkoutItem: (days) => `Pro — ${days} dias de acesso ilimitado`,
  scriptBlocked:
    "Não foi possível carregar a janela de pagamento. Verifique sua conexão ou seu bloqueador de anúncios.",
  startFailed: "Não foi possível iniciar o pagamento. Tente novamente.",
  closedNotice: "Pagamento fechado — nada foi cobrado.",
  paymentFailed: "O pagamento não foi concluído.",
  verifyFailed: "Não conseguimos confirmar seu pagamento.",
  verifyPending:
    "Seu pagamento foi aprovado, mas a ativação ainda está sendo concluída. Atualize a página da sua conta em instantes.",
  verifyUnreachable:
    "Seu pagamento foi aprovado, mas não conseguimos confirmá-lo aqui. Atualize esta página em instantes ou fale conosco se o Pro ainda não estiver ativo.",
  genericError: "Algo deu errado ao iniciar o pagamento. Tente novamente.",
};

const es = {
  limitTitle: "Has alcanzado el límite gratuito",
  limitMessage: (runs, price, days) =>
    `Has usado tus ${runs} usos gratuitos. Acceso ilimitado desde ${price} por ${days} días.`,
  genericMessage: "Quita los límites y sigue escribiendo.",
  features: [
    "Humanizaciones ilimitadas, sin límite diario",
    "Sin límite de palabras por texto",
    "Pago único, sin renovación automática",
  ],
  unlockCta: (price, days) => `Desbloquear Pro — ${price} por ${days} días`,
  comparePlans: "Comparar planes",
  close: "Cerrar",

  choosePass: "Elige un pase",
  days: (n) => `${n} días`,
  bestValue: "Mejor precio",
  perDay: (price) => `${price} al día`,

  previewSummary: (done, total) => `${done} de ${total} palabras humanizadas.`,
  previewPitch: (price, days) =>
    `Pro termina este texto y te da humanizaciones ilimitadas, sin límite de palabras, desde ${price} por ${days} días.`,
  previewButton: (price) => `Desbloquear el resto — desde ${price} →`,

  proActive: "Ya eres Pro: sin límite diario ni de palabras.",

  getPro: (price, days) => `Obtener Pro — ${price} por ${days} días`,
  addDays: (days, price) => `Añadir ${days} días — ${price}`,
  opening: "Abriendo el pago…",
  checkoutItem: (days) => `Pro — ${days} días de acceso ilimitado`,
  scriptBlocked:
    "No se pudo cargar la ventana de pago. Revisa tu conexión o tu bloqueador de anuncios.",
  startFailed: "No se pudo iniciar el pago. Inténtalo de nuevo.",
  closedNotice: "Pago cerrado: no se te ha cobrado nada.",
  paymentFailed: "El pago no se completó.",
  verifyFailed: "No pudimos confirmar tu pago.",
  verifyPending:
    "Tu pago se ha realizado, pero la activación aún está en curso. Actualiza la página de tu cuenta en un momento.",
  verifyUnreachable:
    "Tu pago se ha realizado, pero no pudimos confirmarlo aquí. Actualiza esta página en un momento o contáctanos si Pro sigue sin estar activo.",
  genericError: "Algo salió mal al iniciar el pago. Inténtalo de nuevo.",
};

const de = {
  limitTitle: "Du hast dein Gratis-Limit erreicht",
  limitMessage: (runs, price, days) =>
    `Du hast alle ${runs} kostenlosen Durchläufe genutzt. Unbegrenzter Zugang ab ${price} für ${days} Tage.`,
  genericMessage: "Entferne die Limits und mach weiter.",
  features: [
    "Unbegrenzte Humanizer-Durchläufe, kein Tageslimit",
    "Kein Wortlimit pro Text",
    "Einmalzahlung, keine automatische Verlängerung",
  ],
  unlockCta: (price, days) => `Pro freischalten — ${price} für ${days} Tage`,
  comparePlans: "Tarife vergleichen",
  close: "Schließen",

  choosePass: "Pass wählen",
  days: (n) => `${n} Tage`,
  bestValue: "Bestes Angebot",
  perDay: (price) => `${price} pro Tag`,

  previewSummary: (done, total) => `${done} von ${total} Wörtern humanisiert.`,
  previewPitch: (price, days) =>
    `Pro stellt diesen Text fertig und bietet unbegrenzte Durchläufe ohne Wortlimit — ab ${price} für ${days} Tage.`,
  previewButton: (price) => `Rest freischalten — ab ${price} →`,

  proActive: "Du bist Pro — kein Tageslimit, kein Wortlimit.",

  getPro: (price, days) => `Pro holen — ${price} für ${days} Tage`,
  addDays: (days, price) => `${days} Tage hinzufügen — ${price}`,
  opening: "Zahlung wird geöffnet…",
  checkoutItem: (days) => `Pro — ${days} Tage unbegrenzter Zugang`,
  scriptBlocked:
    "Das Zahlungsfenster konnte nicht geladen werden. Prüfe deine Verbindung oder deinen Werbeblocker.",
  startFailed: "Die Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.",
  closedNotice: "Zahlung geschlossen — dir wurde nichts berechnet.",
  paymentFailed: "Die Zahlung ist nicht durchgegangen.",
  verifyFailed: "Wir konnten deine Zahlung nicht bestätigen.",
  verifyPending:
    "Deine Zahlung ist eingegangen, die Aktivierung läuft noch. Aktualisiere deine Kontoseite gleich noch einmal.",
  verifyUnreachable:
    "Deine Zahlung ist eingegangen, aber wir konnten sie hier nicht bestätigen. Aktualisiere diese Seite gleich noch einmal oder kontaktiere uns, falls Pro dann noch nicht aktiv ist.",
  genericError: "Beim Starten der Zahlung ist etwas schiefgelaufen. Bitte versuche es erneut.",
};

const TEXT = { en, fr, pt, es, de };

/**
 * The paywall strings for a language, with English filling any gap.
 *
 * @param {string} lang
 * @returns {typeof en}
 */
export function getPaywallText(lang) {
  const chosen = TEXT[lang];
  return chosen && chosen !== en ? { ...en, ...chosen } : en;
}
