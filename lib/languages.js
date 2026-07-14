/**
 * Data for the by-language landing pages (`/es`, `/fr`, `/de`, `/pt`).
 *
 * Quality bar (see SEO-AUDIT.md Part 11): every entry carries fully localized,
 * language-SPECIFIC copy — the "how AI sounds in this language" section names
 * that language's actual tells, which differ per language (German: Nominalstil;
 * Spanish/Portuguese: "no solo/não apenas… sino/mas também"; French: "cela"
 * everywhere, "permet de" chains). A page that could be produced by
 * find-and-replace on a sibling is below the bar — don't ship it.
 *
 * Shipping a new language requires BOTH:
 *   1. an entry here, and
 *   2. a matching rules entry in lib/languageRules.js (the pipeline must
 *      actually handle the language before the page goes live).
 *
 * `ui` strings are passed as props into the client tool components; keep them
 * plain serializable strings (no functions, no JSX).
 */

export const languages = [
  // ─── Spanish ────────────────────────────────────────────────────────────────
  {
    slug: "es",
    hreflang: "es",
    ogLocale: "es_ES",
    name: "Spanish",
    nativeName: "Español",
    lastUpdated: "2026-07-14",
    metaTitle: "Humanizador de Texto IA en Español — Gratis",
    metaDescription:
      "Humaniza texto de IA en español gratis. Convierte la salida de ChatGPT, Claude o Gemini en escritura natural con reglas específicas para el español. Sin registro.",
    h1: "Humanizador de Texto IA en Español",
    keyword: "humanizar texto ia",
    hero:
      "Pega tu texto generado por IA y recíbelo reescrito con ritmo natural, transiciones humanas y vocabulario de verdad, en español. Simply Humanize no traduce ni aplica reglas pensadas para el inglés: la herramienta trabaja con las señales típicas del texto de IA en español, desde el «cabe destacar que» hasta las frases de 30 palabras que nadie escribiría.",
    sections: [
      {
        heading: "Cómo suena el texto de IA en español",
        body: "El texto generado por IA en español tiene señales propias, distintas de las del inglés. Los párrafos empiezan casi siempre igual: «Sin embargo», «Además», «Por otro lado». Aparecen fórmulas que ningún hablante usa al escribir con naturalidad: «cabe destacar que», «es importante mencionar que», «en el mundo actual». La estructura «no solo... sino también» se repite hasta el cansancio. El vocabulario se infla: todo es «crucial», «fundamental» o «esencial», los proyectos «fomentan» y «potencian», y cualquier tema se convierte en un «panorama» o un «ámbito». Y luego está el ritmo: frases de 25 a 35 palabras, una tras otra, sin una sola frase corta que respire. Un lector nativo percibe ese patrón aunque no sepa nombrarlo. La suma de esas señales es lo que hace que un texto «suene a IA», y es exactamente lo que esta herramienta corrige.",
      },
      {
        heading: "Reglas para el español, no inglés traducido",
        body: "La mayoría de los humanizadores aplican al español las mismas reglas que usan para el inglés: listas de palabras anglosajonas, contracciones que en español no existen, sustituciones pensadas para otro idioma. El resultado suele ser peor que el original. Simply Humanize funciona distinto. Cuando el texto está en español, el proceso completo usa un conjunto de reglas propio: las transiciones formales típicas del español generado por IA, las muletillas que los modelos repiten en español, y sustituciones de vocabulario que un editor hispanohablante haría de verdad («utilizar» por «usar», «llevar a cabo» por «hacer»). Los objetivos de ritmo, como variar la longitud de las frases, incluir frases cortas y evitar la raya como inciso constante, funcionan en cualquier idioma y también se aplican. La puntuación española se respeta: signos de apertura, comillas y registro se conservan tal como estaban.",
      },
      {
        heading: "Cómo humanizar tu texto en tres pasos",
        steps: [
          "Pega tu texto generado por IA en el cuadro de arriba. Funciona con salidas de ChatGPT, Claude, Gemini o cualquier otro modelo, entre 50 y 20.000 caracteres.",
          "Pulsa «Humanizar texto» y espera unos segundos. El texto pasa por un proceso de reescritura en tres etapas con reglas específicas para el español.",
          "Revisa el resultado, compáralo con el original y cópialo. Añade tus propios ejemplos y opiniones: eso es lo que ningún modelo puede aportar.",
        ],
      },
      {
        heading: "Qué cambia y qué se conserva",
        body: "La herramienta reescribe la forma, no el fondo. Tus datos, cifras, nombres y argumentos se conservan exactamente igual, y la estructura general del texto también. Lo que cambia es la entrega: frases largas que se dividen, transiciones de plantilla que desaparecen, vocabulario inflado que vuelve a ser lenguaje normal, y un ritmo que alterna frases largas con frases cortas, como escribe la gente de verdad. El registro se mantiene: si tu texto trata de usted al lector, el resultado también lo hará. Y nada se traduce: el texto entra en español y sale en español. Conviene revisar siempre el resultado antes de usarlo, sobre todo en textos técnicos o con terminología muy específica.",
      },
      {
        heading: "Una postura honesta sobre los detectores de IA",
        body: "Muchas herramientas prometen «100 % humano garantizado» frente a los detectores de IA. Nosotros no, y es deliberado. Los detectores cambian constantemente, producen falsos positivos documentados y ningún servicio serio puede garantizar un resultado concreto. Lo que sí hace Simply Humanize es que tu texto suene natural: ritmo variado, transiciones humanas, vocabulario normal. Eso mejora la experiencia de quien lo lee, que es lo que importa de verdad. Si vas a usar el texto en un contexto académico o profesional con normas sobre el uso de IA, sigue esas normas. La herramienta mejora la escritura; las decisiones sobre cómo usarla son tuyas.",
      },
    ],
    faqs: [
      {
        q: "¿Es gratis humanizar texto en español?",
        a: "Sí, completamente gratis. Sin cuenta, sin tarjeta y sin límite de usos por sesión. Pega tu texto y recibe el resultado en segundos.",
      },
      {
        q: "¿La herramienta traduce mi texto?",
        a: "No. El texto entra en español y sale en español. La herramienta aplica reglas de reescritura específicas para el español; nada se traduce ni se mezcla con inglés.",
      },
      {
        q: "¿Cambiará el significado o los datos de mi texto?",
        a: "No. Los hechos, las cifras, los nombres y los argumentos se conservan. Cambian el ritmo, las transiciones y el vocabulario. Aun así, revisa siempre el resultado antes de publicarlo, como harías con cualquier editor.",
      },
      {
        q: "¿Funciona con textos académicos y profesionales?",
        a: "Sí. Ensayos, trabajos, correos, informes, artículos de blog y descripciones de producto funcionan bien. Para textos muy largos, envíalos por secciones para obtener mejores resultados.",
      },
      {
        q: "¿El resultado pasará un detector de IA?",
        a: "No hacemos promesas sobre detectores, y nunca las haremos: sería una afirmación irresponsable. Los detectores cambian y cometen errores. Lo que la herramienta hace es que tu texto suene natural y se lea mejor.",
      },
      {
        q: "¿Qué variedades de español admite?",
        a: "Todas. La herramienta conserva la variedad y el registro del texto original: si escribes en español de México, de Argentina o de España, con tú, usted o vos, el resultado mantiene esa misma voz.",
      },
    ],
    samples: [
      "En el mundo actual, la gestión eficaz del tiempo desempeña un papel crucial en la productividad de los profesionales. Es importante destacar que establecer prioridades claras resulta fundamental para alcanzar los objetivos propuestos. Además, la utilización de herramientas digitales permite optimizar los procesos de trabajo de manera significativa. Sin embargo, no debemos olvidar que el descanso adecuado también contribuye al rendimiento general. En conclusión, adoptar hábitos estructurados no solo mejora la eficiencia, sino que también fomenta un equilibrio saludable entre la vida laboral y personal.",
    ],
    ui: {
      form: {
        header: "Contenido generado por IA",
        sampleButton: "Probar un ejemplo",
        ctrlHint: "Ctrl+Entrar para enviar",
        placeholder: "Pega aquí tu texto generado por IA...",
        charsLabel: "caracteres",
        wordsLabel: "palabras",
        submit: "Humanizar texto",
        submitting: "Humanizando...",
        tooShort: "Escribe al menos 50 caracteres.",
        networkError: "Error de red. Comprueba tu conexión e inténtalo de nuevo.",
        unexpectedError: "Ocurrió un error inesperado.",
      },
      output: {
        header: "Texto humanizado",
        wordsLabel: "palabras",
        copy: "Copiar",
        copied: "¡Copiado!",
        clear: "Borrar",
        emptyTitle: "Tu texto humanizado aparecerá aquí",
        emptyBody: "Pega el texto generado por IA a la izquierda y pulsa «Humanizar texto» para empezar.",
        loadingTitle: "Humanizando tu texto...",
        loadingSubtitle: "Aplicando la reescritura en 3 etapas",
      },
      stats: {
        title: "Análisis (Etapa 1)",
        sentences: "Frases",
        avgLength: "Long. media",
        burstiness: "Variación",
        overused: "Palabras repetidas detectadas:",
        ratings: { excellent: "Excelente", good: "Buena", moderate: "Media", uniform: "Uniforme" },
      },
      chips: [
        "Frases variadas",
        "Fluidez natural",
        "Tono mejorado",
        "Sin repeticiones",
        "Ritmo y cadencia",
        "Pulido editorial",
      ],
      page: {
        breadcrumbHome: "Inicio",
        tryFree: "Pruébalo gratis, sin cuenta",
        faqTitle: "Preguntas frecuentes",
        moreLanguages: "Disponible en otros idiomas",
        ctaPrimary: "Prueba Simply Humanize, es gratis →",
        ctaSecondary: "Cómo funciona",
      },
    },
  },

  // ─── French ─────────────────────────────────────────────────────────────────
  {
    slug: "fr",
    hreflang: "fr",
    ogLocale: "fr_FR",
    name: "French",
    nativeName: "Français",
    lastUpdated: "2026-07-14",
    metaTitle: "Humaniser un Texte IA en Français — Gratuit",
    metaDescription:
      "Humanisez vos textes IA en français gratuitement. Transformez les sorties de ChatGPT, Claude ou Gemini en écriture naturelle, avec des règles conçues pour le français. Sans inscription.",
    h1: "Humaniser un Texte IA en Français",
    keyword: "humaniser texte ia",
    hero:
      "Collez votre texte généré par IA et récupérez une version au rythme naturel, avec de vraies transitions et un vocabulaire humain, en français. Simply Humanize ne traduit rien et n'applique pas des règles pensées pour l'anglais : l'outil cible les signaux typiques du texte d'IA en français, du « il convient de souligner » aux phrases interminables que personne n'écrirait.",
    sections: [
      {
        heading: "À quoi ressemble un texte d'IA en français",
        body: "Le texte généré par IA en français a ses propres signaux, différents de ceux de l'anglais. Les paragraphes s'ouvrent presque toujours pareil : « De plus », « En outre », « Par ailleurs », « Cependant ». Des formules que personne n'écrit spontanément reviennent en boucle : « il est important de noter que », « il convient de souligner que », « dans un monde en constante évolution ». La structure « non seulement... mais aussi » revient sans arrêt. Le vocabulaire gonfle : tout est « crucial », « essentiel » ou « incontournable », chaque sujet devient un « paysage » ou un « écosystème », et les verbes s'enchaînent en « permet de... ce qui permet de... ». Autre signe qui ne trompe pas : « cela » partout où un humain écrirait « ça ». Ajoutez des phrases de 25 à 35 mots, toutes de la même longueur, et vous obtenez ce ton reconnaissable entre mille. C'est exactement ce que cet outil corrige.",
      },
      {
        heading: "Des règles conçues pour le français, pas de l'anglais traduit",
        body: "La plupart des humanisateurs appliquent au français les règles construites pour l'anglais : listes de mots anglo-saxons, contractions qui n'existent pas en français, substitutions pensées pour une autre langue. Le résultat est souvent pire que l'original. Simply Humanize fonctionne autrement. Quand le texte est en français, tout le processus utilise un jeu de règles dédié : les transitions formelles typiques de l'IA en français, les tics de langage des modèles en français, et des substitutions qu'un éditeur francophone ferait réellement (« effectuer » devient « faire », « afin de » devient « pour »). Les objectifs de rythme, comme varier la longueur des phrases, insérer des phrases courtes et limiter le tiret cadratin, valent dans toutes les langues et s'appliquent aussi. La ponctuation française est respectée : espaces, guillemets et registre restent en place.",
      },
      {
        heading: "Comment humaniser votre texte en trois étapes",
        steps: [
          "Collez votre texte généré par IA dans le champ ci-dessus. Les sorties de ChatGPT, Claude, Gemini ou tout autre modèle fonctionnent, entre 50 et 20 000 caractères.",
          "Cliquez sur « Humaniser le texte » et patientez quelques secondes. Le texte passe par une réécriture en trois étapes avec des règles propres au français.",
          "Relisez le résultat, comparez-le à l'original et copiez-le. Ajoutez vos exemples et votre point de vue : c'est ce qu'aucun modèle ne peut fournir.",
        ],
      },
      {
        heading: "Ce qui change, ce qui reste",
        body: "L'outil réécrit la forme, pas le fond. Vos faits, chiffres, noms et arguments restent exactement les mêmes, tout comme la structure d'ensemble. Ce qui change, c'est la livraison : les phrases interminables sont découpées, les transitions de modèle disparaissent, le vocabulaire gonflé redevient de la langue normale, et le rythme alterne phrases longues et phrases courtes, comme écrivent les gens. Le registre est conservé : si votre texte vouvoie le lecteur, le résultat aussi. Et rien n'est traduit : le texte entre en français et ressort en français. Relisez toujours le résultat avant de l'utiliser, surtout pour les textes techniques ou très spécialisés.",
      },
      {
        heading: "Une position honnête sur les détecteurs d'IA",
        body: "Beaucoup d'outils promettent du « 100 % humain garanti » face aux détecteurs d'IA. Pas nous, et c'est voulu. Les détecteurs changent en permanence, produisent des faux positifs documentés, et aucun service sérieux ne peut garantir un score. Ce que fait Simply Humanize, c'est rendre votre texte naturel : rythme varié, transitions humaines, vocabulaire normal. C'est ce qui compte pour la personne qui vous lit. Si vous utilisez le texte dans un cadre académique ou professionnel soumis à des règles sur l'IA, suivez ces règles. L'outil améliore l'écriture ; les décisions d'usage vous appartiennent.",
      },
    ],
    faqs: [
      {
        q: "L'humanisation de texte en français est-elle gratuite ?",
        a: "Oui, entièrement gratuite. Pas de compte, pas de carte bancaire, pas de limite d'utilisation par session. Collez votre texte et récupérez le résultat en quelques secondes.",
      },
      {
        q: "L'outil traduit-il mon texte ?",
        a: "Non. Le texte entre en français et ressort en français. L'outil applique des règles de réécriture propres au français ; rien n'est traduit ni mélangé à de l'anglais.",
      },
      {
        q: "Le sens ou les données de mon texte vont-ils changer ?",
        a: "Non. Les faits, les chiffres, les noms et les arguments sont conservés. Seuls le rythme, les transitions et le vocabulaire changent. Relisez toujours le résultat avant publication, comme avec n'importe quel éditeur.",
      },
      {
        q: "Est-ce que ça marche pour les textes académiques et professionnels ?",
        a: "Oui. Dissertations, mémoires, e-mails, rapports, articles de blog et fiches produit fonctionnent bien. Pour les textes très longs, procédez par sections pour un meilleur résultat.",
      },
      {
        q: "Le résultat passera-t-il un détecteur d'IA ?",
        a: "Nous ne faisons aucune promesse sur les détecteurs, et nous n'en ferons jamais : ce serait irresponsable. Les détecteurs évoluent et se trompent. Ce que fait l'outil, c'est rendre votre texte naturel et agréable à lire.",
      },
      {
        q: "Quelles variétés de français sont prises en charge ?",
        a: "Toutes. L'outil conserve la variété et le registre du texte d'origine : français de France, de Belgique, de Suisse ou du Québec, tutoiement ou vouvoiement, la voix reste la même.",
      },
    ],
    samples: [
      "Dans le monde numérique actuel, la gestion efficace du temps joue un rôle crucial dans la productivité des professionnels. Il est important de noter que l'établissement de priorités claires s'avère essentiel pour atteindre les objectifs fixés. De plus, l'utilisation d'outils numériques permet d'optimiser considérablement les processus de travail. Cependant, il convient de souligner que le repos adéquat contribue également à la performance globale. En conclusion, l'adoption d'habitudes structurées améliore non seulement l'efficacité, mais favorise aussi un équilibre sain entre vie professionnelle et vie personnelle.",
    ],
    ui: {
      form: {
        header: "Contenu généré par IA",
        sampleButton: "Essayer un exemple",
        ctrlHint: "Ctrl+Entrée pour envoyer",
        placeholder: "Collez ici votre texte généré par IA...",
        charsLabel: "caractères",
        wordsLabel: "mots",
        submit: "Humaniser le texte",
        submitting: "Humanisation...",
        tooShort: "Saisissez au moins 50 caractères.",
        networkError: "Erreur réseau. Vérifiez votre connexion et réessayez.",
        unexpectedError: "Une erreur inattendue s'est produite.",
      },
      output: {
        header: "Texte humanisé",
        wordsLabel: "mots",
        copy: "Copier",
        copied: "Copié !",
        clear: "Effacer",
        emptyTitle: "Votre texte humanisé apparaîtra ici",
        emptyBody: "Collez un texte généré par IA à gauche et cliquez sur « Humaniser le texte » pour commencer.",
        loadingTitle: "Humanisation de votre texte...",
        loadingSubtitle: "Réécriture en 3 étapes en cours",
      },
      stats: {
        title: "Analyse (Étape 1)",
        sentences: "Phrases",
        avgLength: "Long. moyenne",
        burstiness: "Variation",
        overused: "Mots répétés détectés :",
        ratings: { excellent: "Excellente", good: "Bonne", moderate: "Moyenne", uniform: "Uniforme" },
      },
      chips: [
        "Phrases variées",
        "Fluidité naturelle",
        "Ton amélioré",
        "Moins de répétitions",
        "Rythme et cadence",
        "Finition éditoriale",
      ],
      page: {
        breadcrumbHome: "Accueil",
        tryFree: "Essayez gratuitement, sans compte",
        faqTitle: "Questions fréquentes",
        moreLanguages: "Disponible dans d'autres langues",
        ctaPrimary: "Essayez Simply Humanize, c'est gratuit →",
        ctaSecondary: "Comment ça marche",
      },
    },
  },

  // ─── German ─────────────────────────────────────────────────────────────────
  {
    slug: "de",
    hreflang: "de",
    ogLocale: "de_DE",
    name: "German",
    nativeName: "Deutsch",
    lastUpdated: "2026-07-14",
    metaTitle: "KI-Text menschlich machen — kostenlos auf Deutsch",
    metaDescription:
      "KI-Texte auf Deutsch menschlich umschreiben, kostenlos. Verwandeln Sie ChatGPT-, Claude- oder Gemini-Ausgaben in natürliche Texte, mit Regeln speziell für Deutsch. Ohne Anmeldung.",
    h1: "KI-Text menschlich machen",
    keyword: "ki text menschlich machen",
    hero:
      "Fügen Sie Ihren KI-generierten Text ein und erhalten Sie eine Version mit natürlichem Rhythmus, echten Übergängen und menschlicher Wortwahl, auf Deutsch. Simply Humanize übersetzt nichts und wendet keine fürs Englische gebauten Regeln an: Das Tool kennt die typischen KI-Signale im Deutschen, vom Nominalstil bis zum ewigen „darüber hinaus“.",
    sections: [
      {
        heading: "Woran man KI-Texte auf Deutsch erkennt",
        body: "KI-generierte Texte haben im Deutschen ihre eigenen Signale, und sie unterscheiden sich von denen im Englischen. Absätze beginnen fast immer gleich: „Darüber hinaus“, „Des Weiteren“, „Zudem“. Floskeln, die kein Mensch freiwillig schreibt, tauchen in Serie auf: „Es ist wichtig zu beachten, dass“, „Zusammenfassend lässt sich sagen“. Das stärkste Signal ist aber der Nominalstil: „Die Implementierung der Maßnahmen führt zu einer Verbesserung der Ergebnisse“, wo ein Mensch schreiben würde: „Wenn man die Maßnahmen umsetzt, werden die Ergebnisse besser.“ Dazu kommen „nicht nur … sondern auch“ in jedem zweiten Absatz, „eine Vielzahl von“ statt „viele“, und Adjektive wie „entscheidend“, „essenziell“ und „nahtlos“ in jeder Zeile. Und der Rhythmus: Sätze mit 25 bis 35 Wörtern, einer nach dem anderen, ohne einen einzigen kurzen Satz dazwischen. Genau diese Muster korrigiert dieses Tool.",
      },
      {
        heading: "Regeln für Deutsch, kein übersetztes Englisch",
        body: "Die meisten Humanizer wenden auf deutsche Texte dieselben Regeln an, die für Englisch gebaut wurden: Listen angelsächsischer Wörter, Kontraktionen, die es im Deutschen nicht gibt, Ersetzungen für eine andere Sprache. Das Ergebnis ist oft schlechter als das Original. Simply Humanize arbeitet anders. Ist der Text deutsch, nutzt der gesamte Prozess ein eigenes Regelwerk: die typischen formellen Übergänge deutscher KI-Texte, die Füllfloskeln der Modelle auf Deutsch, und Ersetzungen, die ein deutschsprachiger Lektor wirklich vornehmen würde („durchführen“ wird „machen“, „benötigen“ wird „brauchen“). Der Nominalstil wird gezielt aufgebrochen. Die sprachunabhängigen Ziele, wie Satzlängen variieren, kurze Sätze einstreuen und Gedankenstriche als Dauereinschub vermeiden, gelten zusätzlich. Rechtschreibung, Anführungszeichen und Anrede bleiben, wie sie waren.",
      },
      {
        heading: "So machen Sie Ihren KI-Text menschlich",
        steps: [
          "Fügen Sie Ihren KI-generierten Text oben ein. Ausgaben von ChatGPT, Claude, Gemini oder jedem anderen Modell funktionieren, zwischen 50 und 20.000 Zeichen.",
          "Klicken Sie auf „Text humanisieren“ und warten Sie ein paar Sekunden. Der Text durchläuft eine dreistufige Überarbeitung mit Regeln speziell für Deutsch.",
          "Prüfen Sie das Ergebnis, vergleichen Sie es mit dem Original und kopieren Sie es. Ergänzen Sie eigene Beispiele und Einschätzungen: Das kann kein Modell liefern.",
        ],
      },
      {
        heading: "Was sich ändert und was bleibt",
        body: "Das Tool schreibt die Form um, nicht den Inhalt. Fakten, Zahlen, Namen und Argumente bleiben exakt erhalten, ebenso die Gesamtstruktur. Was sich ändert, ist die Umsetzung: Schachtelsätze werden geteilt, Floskelübergänge verschwinden, aufgeblähtes Vokabular wird wieder normale Sprache, und der Rhythmus wechselt zwischen langen und kurzen Sätzen, so wie Menschen schreiben. Die Anrede bleibt erhalten: Siezt Ihr Text den Leser, tut es das Ergebnis auch. Und nichts wird übersetzt: Der Text geht auf Deutsch hinein und kommt auf Deutsch heraus. Prüfen Sie das Ergebnis trotzdem immer, besonders bei technischen oder fachsprachlichen Texten.",
      },
      {
        heading: "Eine ehrliche Position zu KI-Detektoren",
        body: "Viele Tools versprechen „garantiert 100 % menschlich“ gegenüber KI-Detektoren. Wir nicht, und zwar bewusst. Detektoren ändern sich ständig, produzieren dokumentierte Fehlalarme, und kein seriöser Dienst kann ein bestimmtes Ergebnis garantieren. Was Simply Humanize leistet: Ihr Text klingt natürlich, mit variiertem Rhythmus, menschlichen Übergängen und normalem Vokabular. Das ist es, was für Ihre Leser zählt. Wenn Sie den Text in einem akademischen oder beruflichen Kontext mit KI-Richtlinien verwenden, halten Sie sich an diese Richtlinien. Das Tool verbessert das Schreiben; die Entscheidungen über die Nutzung liegen bei Ihnen.",
      },
    ],
    faqs: [
      {
        q: "Ist das Humanisieren deutscher Texte kostenlos?",
        a: "Ja, komplett kostenlos. Kein Konto, keine Kreditkarte, keine Nutzungsgrenze pro Sitzung. Text einfügen, Ergebnis in Sekunden erhalten.",
      },
      {
        q: "Übersetzt das Tool meinen Text?",
        a: "Nein. Der Text geht auf Deutsch hinein und kommt auf Deutsch heraus. Das Tool wendet Umschreibregeln speziell für Deutsch an; nichts wird übersetzt oder mit Englisch vermischt.",
      },
      {
        q: "Ändert sich die Bedeutung oder ändern sich die Daten?",
        a: "Nein. Fakten, Zahlen, Namen und Argumente bleiben erhalten. Rhythmus, Übergänge und Vokabular ändern sich. Prüfen Sie das Ergebnis trotzdem vor der Veröffentlichung, wie bei jedem Lektorat.",
      },
      {
        q: "Funktioniert es für Uni- und Berufstexte?",
        a: "Ja. Hausarbeiten, E-Mails, Berichte, Blogartikel und Produkttexte funktionieren gut. Sehr lange Texte liefern in Abschnitten bessere Ergebnisse.",
      },
      {
        q: "Besteht das Ergebnis KI-Detektoren?",
        a: "Wir machen keine Versprechen zu Detektoren, und das wird so bleiben: Alles andere wäre unseriös. Detektoren ändern sich und irren sich. Das Tool sorgt dafür, dass Ihr Text natürlich klingt und sich besser liest.",
      },
      {
        q: "Bleibt die Anrede erhalten, Sie oder du?",
        a: "Ja. Das Tool übernimmt Register und Tonlage des Originals: Ein Text, der siezt, siezt auch danach; ein lockerer Du-Text bleibt locker.",
      },
    ],
    samples: [
      "In der heutigen digitalen Welt spielt effektives Zeitmanagement eine entscheidende Rolle für die Produktivität von Fachkräften. Es ist wichtig zu beachten, dass die Festlegung klarer Prioritäten für die Erreichung der gesetzten Ziele von entscheidender Bedeutung ist. Darüber hinaus ermöglicht die Nutzung digitaler Werkzeuge eine erhebliche Optimierung der Arbeitsprozesse. Dennoch sollte nicht vergessen werden, dass ausreichende Erholung ebenfalls zur allgemeinen Leistungsfähigkeit beiträgt. Zusammenfassend lässt sich sagen, dass die Einführung strukturierter Gewohnheiten nicht nur die Effizienz verbessert, sondern auch ein gesundes Gleichgewicht zwischen Berufs- und Privatleben fördert.",
    ],
    ui: {
      form: {
        header: "KI-generierter Inhalt",
        sampleButton: "Beispiel ausprobieren",
        ctrlHint: "Strg+Enter zum Absenden",
        placeholder: "Fügen Sie hier Ihren KI-generierten Text ein...",
        charsLabel: "Zeichen",
        wordsLabel: "Wörter",
        submit: "Text humanisieren",
        submitting: "Wird umgeschrieben...",
        tooShort: "Bitte mindestens 50 Zeichen eingeben.",
        networkError: "Netzwerkfehler. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        unexpectedError: "Ein unerwarteter Fehler ist aufgetreten.",
      },
      output: {
        header: "Menschlicher Text",
        wordsLabel: "Wörter",
        copy: "Kopieren",
        copied: "Kopiert!",
        clear: "Leeren",
        emptyTitle: "Ihr umgeschriebener Text erscheint hier",
        emptyBody: "Fügen Sie links KI-generierten Text ein und klicken Sie auf „Text humanisieren“.",
        loadingTitle: "Ihr Text wird umgeschrieben...",
        loadingSubtitle: "3-stufige Überarbeitung läuft",
      },
      stats: {
        title: "Analyse (Stufe 1)",
        sentences: "Sätze",
        avgLength: "Ø Länge",
        burstiness: "Variation",
        overused: "Häufig wiederholte Wörter:",
        ratings: { excellent: "Exzellent", good: "Gut", moderate: "Mittel", uniform: "Einheitlich" },
      },
      chips: [
        "Abwechslungsreiche Sätze",
        "Natürlicher Fluss",
        "Besserer Ton",
        "Weniger Wiederholung",
        "Rhythmus und Tempo",
        "Redaktioneller Feinschliff",
      ],
      page: {
        breadcrumbHome: "Startseite",
        tryFree: "Kostenlos testen, ohne Konto",
        faqTitle: "Häufige Fragen",
        moreLanguages: "In weiteren Sprachen verfügbar",
        ctaPrimary: "Simply Humanize testen, kostenlos →",
        ctaSecondary: "So funktioniert es",
      },
    },
  },

  // ─── Portuguese ─────────────────────────────────────────────────────────────
  {
    slug: "pt",
    hreflang: "pt",
    ogLocale: "pt_BR",
    name: "Portuguese",
    nativeName: "Português",
    lastUpdated: "2026-07-14",
    metaTitle: "Humanizar Texto de IA em Português — Grátis",
    metaDescription:
      "Humanize texto de IA em português, grátis. Transforme saídas do ChatGPT, Claude ou Gemini em escrita natural, com regras feitas para o português. Sem cadastro.",
    h1: "Humanizar Texto de IA em Português",
    keyword: "humanizar texto de ia",
    hero:
      "Cole o seu texto gerado por IA e receba uma versão com ritmo natural, transições humanas e vocabulário de verdade, em português. O Simply Humanize não traduz nada nem aplica regras pensadas para o inglês: a ferramenta conhece os sinais típicos do texto de IA em português, do «vale ressaltar que» às frases de 30 palavras que ninguém escreveria.",
    sections: [
      {
        heading: "Como soa o texto de IA em português",
        body: "O texto gerado por IA em português tem sinais próprios, diferentes dos do inglês. Os parágrafos começam quase sempre igual: «Além disso», «No entanto», «Por outro lado». Fórmulas que ninguém usa ao escrever com naturalidade se repetem: «vale ressaltar que», «é importante destacar que», «nos dias de hoje». A estrutura «não apenas... mas também» aparece o tempo todo. O vocabulário incha: tudo é «crucial», «fundamental» ou «essencial», os projetos «alavancam» e «potencializam», e qualquer assunto vira um «panorama» ou um «cenário». E há o ritmo: frases de 25 a 35 palavras, uma atrás da outra, sem uma única frase curta para respirar. Um leitor nativo percebe o padrão mesmo sem saber nomeá-lo. A soma desses sinais é o que faz um texto «soar a IA», e é exatamente isso que esta ferramenta corrige.",
      },
      {
        heading: "Regras feitas para o português, não inglês traduzido",
        body: "A maioria dos humanizadores aplica ao português as mesmas regras construídas para o inglês: listas de palavras anglo-saxônicas, contrações que não existem em português, substituições pensadas para outro idioma. O resultado costuma ser pior que o original. O Simply Humanize funciona diferente. Quando o texto está em português, todo o processo usa um conjunto de regras próprio: as transições formais típicas da IA em português, os cacoetes que os modelos repetem em português, e substituições que um editor lusófono faria de verdade («utilizar» vira «usar», «realizar» vira «fazer»). Os objetivos de ritmo, como variar o comprimento das frases, incluir frases curtas e evitar o travessão como aparte constante, valem em qualquer idioma e também se aplicam. A variante e o registro do texto se conservam como estavam.",
      },
      {
        heading: "Como humanizar seu texto em três passos",
        steps: [
          "Cole o texto gerado por IA no campo acima. Funciona com saídas do ChatGPT, Claude, Gemini ou qualquer outro modelo, entre 50 e 20.000 caracteres.",
          "Clique em «Humanizar texto» e aguarde alguns segundos. O texto passa por uma reescrita em três etapas com regras específicas para o português.",
          "Revise o resultado, compare com o original e copie. Acrescente seus próprios exemplos e opiniões: isso nenhum modelo pode oferecer.",
        ],
      },
      {
        heading: "O que muda e o que permanece",
        body: "A ferramenta reescreve a forma, não o conteúdo. Seus dados, números, nomes e argumentos se conservam exatamente iguais, e a estrutura geral também. O que muda é a entrega: frases longas são divididas, transições de modelo desaparecem, vocabulário inflado volta a ser linguagem normal, e o ritmo alterna frases longas e curtas, como as pessoas escrevem de verdade. O registro se mantém: se o seu texto trata o leitor por você, o resultado também tratará. E nada é traduzido: o texto entra em português e sai em português. Revise sempre o resultado antes de usar, principalmente em textos técnicos ou com terminologia muito específica.",
      },
      {
        heading: "Uma posição honesta sobre detectores de IA",
        body: "Muitas ferramentas prometem «100% humano garantido» diante dos detectores de IA. Nós não, e é de propósito. Os detectores mudam o tempo todo, produzem falsos positivos documentados, e nenhum serviço sério pode garantir um resultado específico. O que o Simply Humanize faz é deixar seu texto natural: ritmo variado, transições humanas, vocabulário normal. É isso que importa para quem lê. Se você vai usar o texto em um contexto acadêmico ou profissional com regras sobre uso de IA, siga essas regras. A ferramenta melhora a escrita; as decisões sobre como usá-la são suas.",
      },
    ],
    faqs: [
      {
        q: "É grátis humanizar texto em português?",
        a: "Sim, totalmente grátis. Sem conta, sem cartão e sem limite de usos por sessão. Cole o texto e receba o resultado em segundos.",
      },
      {
        q: "A ferramenta traduz o meu texto?",
        a: "Não. O texto entra em português e sai em português. A ferramenta aplica regras de reescrita específicas para o português; nada é traduzido nem misturado com inglês.",
      },
      {
        q: "O significado ou os dados do texto vão mudar?",
        a: "Não. Fatos, números, nomes e argumentos se conservam. Mudam o ritmo, as transições e o vocabulário. Ainda assim, revise sempre o resultado antes de publicar, como faria com qualquer editor.",
      },
      {
        q: "Funciona com textos acadêmicos e profissionais?",
        a: "Sim. Trabalhos, e-mails, relatórios, artigos de blog e descrições de produto funcionam bem. Para textos muito longos, envie por seções para melhores resultados.",
      },
      {
        q: "O resultado vai passar em um detector de IA?",
        a: "Não fazemos promessas sobre detectores, e nunca faremos: seria uma afirmação irresponsável. Detectores mudam e erram. O que a ferramenta faz é deixar seu texto natural e mais agradável de ler.",
      },
      {
        q: "Português do Brasil ou de Portugal?",
        a: "Os dois. A ferramenta conserva a variante e o registro do texto original: um texto brasileiro continua brasileiro, um texto europeu continua europeu, com a mesma forma de tratamento.",
      },
    ],
    samples: [
      "No mundo atual, a gestão eficaz do tempo desempenha um papel crucial na produtividade dos profissionais. É importante ressaltar que o estabelecimento de prioridades claras é fundamental para alcançar os objetivos propostos. Além disso, a utilização de ferramentas digitais permite otimizar significativamente os processos de trabalho. No entanto, não podemos esquecer que o descanso adequado também contribui para o desempenho geral. Em suma, a adoção de hábitos estruturados não apenas melhora a eficiência, mas também promove um equilíbrio saudável entre vida profissional e pessoal.",
    ],
    ui: {
      form: {
        header: "Conteúdo gerado por IA",
        sampleButton: "Testar um exemplo",
        ctrlHint: "Ctrl+Enter para enviar",
        placeholder: "Cole aqui o seu texto gerado por IA...",
        charsLabel: "caracteres",
        wordsLabel: "palavras",
        submit: "Humanizar texto",
        submitting: "Humanizando...",
        tooShort: "Digite pelo menos 50 caracteres.",
        networkError: "Erro de rede. Verifique sua conexão e tente novamente.",
        unexpectedError: "Ocorreu um erro inesperado.",
      },
      output: {
        header: "Texto humanizado",
        wordsLabel: "palavras",
        copy: "Copiar",
        copied: "Copiado!",
        clear: "Limpar",
        emptyTitle: "Seu texto humanizado vai aparecer aqui",
        emptyBody: "Cole o texto gerado por IA à esquerda e clique em «Humanizar texto» para começar.",
        loadingTitle: "Humanizando seu texto...",
        loadingSubtitle: "Executando a reescrita em 3 etapas",
      },
      stats: {
        title: "Análise (Etapa 1)",
        sentences: "Frases",
        avgLength: "Média",
        burstiness: "Variação",
        overused: "Palavras repetidas detectadas:",
        ratings: { excellent: "Excelente", good: "Boa", moderate: "Média", uniform: "Uniforme" },
      },
      chips: [
        "Frases variadas",
        "Fluidez natural",
        "Tom melhorado",
        "Menos repetição",
        "Ritmo e cadência",
        "Acabamento editorial",
      ],
      page: {
        breadcrumbHome: "Início",
        tryFree: "Teste grátis, sem conta",
        faqTitle: "Perguntas frequentes",
        moreLanguages: "Disponível em outros idiomas",
        ctaPrimary: "Teste o Simply Humanize, é grátis →",
        ctaSecondary: "Como funciona",
      },
    },
  },
];

/**
 * hreflang map shared by the homepage and every language page so the
 * alternate cluster can never drift. Every page in the cluster must list
 * all members including itself; English is the x-default.
 *
 * @param {string} siteUrl origin without trailing slash
 * @returns {Record<string, string>}
 */
export function languageAlternates(siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "x-default": `${base}/`,
    en: `${base}/`,
    ...Object.fromEntries(languages.map((l) => [l.hreflang, `${base}/${l.slug}`])),
  };
}
