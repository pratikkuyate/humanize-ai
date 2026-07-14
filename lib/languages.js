/**
 * Data for the by-language landing pages (`/es`, `/fr`, `/de`, `/pt`) —
 * SEO-AUDIT.md Part 2, Family D.
 *
 * Each entry is fully localized, language-SPECIFIC copy targeting that
 * language's primary keyword. The "how AI sounds in this language" section
 * names that language's actual tells (they differ per language — German AI
 * text leans on Nominalstil, Spanish/Portuguese on "no solo/não apenas… sino/
 * mas também", French on "cela" everywhere and "permet de" chains). A page
 * that could be produced by find-and-replace on a sibling is below the
 * quality bar (audit Part 11) — don't ship it.
 *
 * NOTE: the humanize pipeline itself is English-tuned and unchanged; the
 * embedded tool is the regular one. Keep the copy honest — do not claim
 * per-language rewrite rules here unless the pipeline actually gets them.
 *
 * `page` holds the localized page furniture (headings around the tool, FAQ
 * title, CTAs). The tool UI itself intentionally stays as-is.
 */

export const languages = [
  // ─── Spanish — keyword: "humanizar texto ia" ───────────────────────────────
  {
    slug: "es",
    hreflang: "es",
    ogLocale: "es_ES",
    name: "Spanish",
    nativeName: "Español",
    lastUpdated: "2026-07-14",
    metaTitle: "Humanizador de Texto IA en Español — Gratis",
    metaDescription:
      "Humaniza texto de IA en español gratis. Pega la salida de ChatGPT, Claude o Gemini y recibe escritura natural en segundos. Sin registro y sin tarjeta.",
    h1: "Humanizador de Texto IA en Español",
    keyword: "humanizar texto ia",
    hero:
      "Pega tu texto generado por IA y recíbelo reescrito con ritmo natural, transiciones humanas y vocabulario de verdad. Simply Humanize es un humanizador de texto IA gratuito: sin cuenta, sin tarjeta y con resultados en segundos, directamente en esta página.",
    sections: [
      {
        heading: "Cómo suena el texto de IA en español",
        body: "El texto generado por IA en español tiene señales propias, distintas de las del inglés. Los párrafos empiezan casi siempre igual: «Sin embargo», «Además», «Por otro lado». Aparecen fórmulas que ningún hablante usa al escribir con naturalidad: «cabe destacar que», «es importante mencionar que», «en el mundo actual». La estructura «no solo... sino también» se repite hasta el cansancio. El vocabulario se infla: todo es «crucial», «fundamental» o «esencial», los proyectos «fomentan» y «potencian», y cualquier tema se convierte en un «panorama» o un «ámbito». Y luego está el ritmo: frases de 25 a 35 palabras, una tras otra, sin una sola frase corta que respire. Un lector nativo percibe ese patrón aunque no sepa nombrarlo. La suma de esas señales es lo que hace que un texto «suene a IA», y es exactamente lo que conviene corregir antes de publicar.",
      },
      {
        heading: "Qué hace un humanizador de texto IA",
        body: "Un humanizador de texto IA reescribe un borrador generado por ChatGPT, Claude, Gemini o cualquier otro modelo para que suene a persona, no a máquina. Simply Humanize aplica un proceso de reescritura en tres etapas: primero analiza la estructura del texto (longitud de las frases, repeticiones, ritmo), después lo reescribe rompiendo los patrones estadísticos típicos de la IA, y al final aplica un pulido editorial para que la lectura fluya. El significado, los datos, las cifras y los nombres se conservan; lo que cambia es la entrega: frases largas que se dividen, transiciones de plantilla que desaparecen, vocabulario inflado que vuelve a ser lenguaje normal, y un ritmo que alterna frases largas con frases cortas, como escribe la gente de verdad.",
      },
      {
        heading: "Cómo humanizar tu texto en tres pasos",
        steps: [
          "Pega tu texto generado por IA en el cuadro de arriba. Funciona con salidas de ChatGPT, Claude, Gemini o cualquier otro modelo, entre 50 y 20.000 caracteres.",
          "Pulsa «Humanize Content» y espera unos segundos mientras el texto pasa por el proceso de reescritura en tres etapas.",
          "Revisa el resultado, compáralo con el original y cópialo. Añade tus propios ejemplos y opiniones: eso es lo que ningún modelo puede aportar.",
        ],
      },
      {
        heading: "Qué cambia y qué se conserva",
        body: "La herramienta reescribe la forma, no el fondo. Tus datos, cifras, nombres y argumentos se conservan, y la estructura general del texto también. Lo que cambia es cómo está contado: menos muletillas, menos frases idénticas en longitud, menos vocabulario de plantilla, más ritmo natural. El resultado aparece junto al original para que puedas comparar ambos antes de copiar nada. Conviene revisar siempre la salida antes de usarla, sobre todo en textos técnicos, académicos o con terminología muy específica: la revisión final es tuya, como con cualquier editor.",
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
        q: "¿Cambiará el significado o los datos de mi texto?",
        a: "No. Los hechos, las cifras, los nombres y los argumentos se conservan. Cambian el ritmo, las transiciones y el vocabulario. Aun así, revisa siempre el resultado antes de publicarlo, como harías con cualquier editor.",
      },
      {
        q: "¿Cuánto texto puedo humanizar de una vez?",
        a: "Entre 50 y 20.000 caracteres por envío. Para documentos muy largos, divídelos en secciones (introducción, desarrollo, conclusión) y obtendrás mejores resultados.",
      },
      {
        q: "¿Funciona con textos académicos y profesionales?",
        a: "Sí. Ensayos, trabajos, correos, informes, artículos de blog y descripciones de producto funcionan bien. Si tu institución o empresa tiene normas sobre el uso de IA, síguelas siempre.",
      },
      {
        q: "¿El resultado pasará un detector de IA?",
        a: "No hacemos promesas sobre detectores, y nunca las haremos: sería una afirmación irresponsable. Los detectores cambian y cometen errores. Lo que la herramienta hace es que tu texto suene natural y se lea mejor.",
      },
      {
        q: "¿Funciona igual de bien en español que en inglés?",
        a: "La herramienta está más afinada en inglés, donde su detección de patrones es más profunda. Con texto en español obtiene buenos resultados en la mayoría de los casos. Pruébala gratis con un texto real y revisa siempre la salida antes de usarla.",
      },
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

  // ─── French — keyword: "humaniser texte ia" ─────────────────────────────────
  {
    slug: "fr",
    hreflang: "fr",
    ogLocale: "fr_FR",
    name: "French",
    nativeName: "Français",
    lastUpdated: "2026-07-14",
    metaTitle: "Humaniser un Texte IA en Français — Gratuit",
    metaDescription:
      "Humanisez vos textes IA en français gratuitement. Collez la sortie de ChatGPT, Claude ou Gemini et obtenez une écriture naturelle en quelques secondes. Sans inscription.",
    h1: "Humaniser un Texte IA en Français",
    keyword: "humaniser texte ia",
    hero:
      "Collez votre texte généré par IA et récupérez une version au rythme naturel, avec de vraies transitions et un vocabulaire humain. Simply Humanize est un humanisateur de texte IA gratuit : pas de compte, pas de carte bancaire, et le résultat arrive en quelques secondes, directement sur cette page.",
    sections: [
      {
        heading: "À quoi ressemble un texte d'IA en français",
        body: "Le texte généré par IA en français a ses propres signaux, différents de ceux de l'anglais. Les paragraphes s'ouvrent presque toujours pareil : « De plus », « En outre », « Par ailleurs », « Cependant ». Des formules que personne n'écrit spontanément reviennent en boucle : « il est important de noter que », « il convient de souligner que », « dans un monde en constante évolution ». La structure « non seulement... mais aussi » revient sans arrêt. Le vocabulaire gonfle : tout est « crucial », « essentiel » ou « incontournable », chaque sujet devient un « paysage » ou un « écosystème », et les verbes s'enchaînent en « permet de... ce qui permet de... ». Autre signe qui ne trompe pas : « cela » partout où un humain écrirait « ça ». Ajoutez des phrases de 25 à 35 mots, toutes de la même longueur, et vous obtenez ce ton reconnaissable entre mille. C'est exactement ce qu'il faut corriger avant de publier.",
      },
      {
        heading: "Ce que fait un humanisateur de texte IA",
        body: "Un humanisateur de texte IA réécrit un brouillon produit par ChatGPT, Claude, Gemini ou tout autre modèle pour qu'il sonne comme une personne, pas comme une machine. Simply Humanize applique une réécriture en trois étapes : l'outil analyse d'abord la structure du texte (longueur des phrases, répétitions, rythme), puis le réécrit en cassant les schémas statistiques typiques de l'IA, et termine par un polissage éditorial pour que la lecture coule. Le sens, les faits, les chiffres et les noms sont conservés ; ce qui change, c'est la livraison : les phrases interminables sont découpées, les transitions de modèle disparaissent, le vocabulaire gonflé redevient de la langue normale, et le rythme alterne phrases longues et phrases courtes, comme écrivent les gens.",
      },
      {
        heading: "Comment humaniser votre texte en trois étapes",
        steps: [
          "Collez votre texte généré par IA dans le champ ci-dessus. Les sorties de ChatGPT, Claude, Gemini ou tout autre modèle fonctionnent, entre 50 et 20 000 caractères.",
          "Cliquez sur « Humanize Content » et patientez quelques secondes pendant que le texte passe par la réécriture en trois étapes.",
          "Relisez le résultat, comparez-le à l'original et copiez-le. Ajoutez vos exemples et votre point de vue : c'est ce qu'aucun modèle ne peut fournir.",
        ],
      },
      {
        heading: "Ce qui change, ce qui reste",
        body: "L'outil réécrit la forme, pas le fond. Vos faits, chiffres, noms et arguments sont conservés, tout comme la structure d'ensemble. Ce qui change, c'est la manière de raconter : moins de formules toutes faites, moins de phrases de longueur identique, moins de vocabulaire de modèle, plus de rythme naturel. Le résultat s'affiche à côté de l'original pour que vous puissiez comparer les deux avant de copier quoi que ce soit. Relisez toujours la sortie avant de l'utiliser, surtout pour les textes techniques, académiques ou très spécialisés : la relecture finale vous appartient, comme avec n'importe quel éditeur.",
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
        q: "Le sens ou les données de mon texte vont-ils changer ?",
        a: "Non. Les faits, les chiffres, les noms et les arguments sont conservés. Seuls le rythme, les transitions et le vocabulaire changent. Relisez toujours le résultat avant publication, comme avec n'importe quel éditeur.",
      },
      {
        q: "Quelle longueur de texte puis-je humaniser d'un coup ?",
        a: "Entre 50 et 20 000 caractères par envoi. Pour les documents très longs, procédez par sections (introduction, développement, conclusion) : le résultat sera meilleur.",
      },
      {
        q: "Est-ce que ça marche pour les textes académiques et professionnels ?",
        a: "Oui. Dissertations, mémoires, e-mails, rapports, articles de blog et fiches produit fonctionnent bien. Si votre établissement ou votre entreprise a des règles sur l'usage de l'IA, respectez-les.",
      },
      {
        q: "Le résultat passera-t-il un détecteur d'IA ?",
        a: "Nous ne faisons aucune promesse sur les détecteurs, et nous n'en ferons jamais : ce serait irresponsable. Les détecteurs évoluent et se trompent. Ce que fait l'outil, c'est rendre votre texte naturel et agréable à lire.",
      },
      {
        q: "L'outil est-il aussi performant en français qu'en anglais ?",
        a: "L'outil est le plus finement réglé en anglais, où sa détection de motifs est la plus poussée. Sur un texte en français, il donne de bons résultats dans la plupart des cas. Testez-le gratuitement sur un vrai texte et relisez toujours la sortie avant de l'utiliser.",
      },
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

  // ─── German — keyword: "ki text menschlich machen" ──────────────────────────
  {
    slug: "de",
    hreflang: "de",
    ogLocale: "de_DE",
    name: "German",
    nativeName: "Deutsch",
    lastUpdated: "2026-07-14",
    metaTitle: "KI-Text menschlich machen — kostenlos auf Deutsch",
    metaDescription:
      "KI-Texte auf Deutsch menschlich umschreiben, kostenlos. Fügen Sie ChatGPT-, Claude- oder Gemini-Ausgaben ein und erhalten Sie natürliche Texte in Sekunden. Ohne Anmeldung.",
    h1: "KI-Text menschlich machen",
    keyword: "ki text menschlich machen",
    hero:
      "Fügen Sie Ihren KI-generierten Text ein und erhalten Sie eine Version mit natürlichem Rhythmus, echten Übergängen und menschlicher Wortwahl. Simply Humanize ist ein kostenloser KI-Humanizer: kein Konto, keine Kreditkarte, und das Ergebnis kommt in Sekunden, direkt auf dieser Seite.",
    sections: [
      {
        heading: "Woran man KI-Texte auf Deutsch erkennt",
        body: "KI-generierte Texte haben im Deutschen ihre eigenen Signale, und sie unterscheiden sich von denen im Englischen. Absätze beginnen fast immer gleich: „Darüber hinaus“, „Des Weiteren“, „Zudem“. Floskeln, die kein Mensch freiwillig schreibt, tauchen in Serie auf: „Es ist wichtig zu beachten, dass“, „Zusammenfassend lässt sich sagen“. Das stärkste Signal ist aber der Nominalstil: „Die Implementierung der Maßnahmen führt zu einer Verbesserung der Ergebnisse“, wo ein Mensch schreiben würde: „Wenn man die Maßnahmen umsetzt, werden die Ergebnisse besser.“ Dazu kommen „nicht nur … sondern auch“ in jedem zweiten Absatz, „eine Vielzahl von“ statt „viele“, und Adjektive wie „entscheidend“, „essenziell“ und „nahtlos“ in jeder Zeile. Und der Rhythmus: Sätze mit 25 bis 35 Wörtern, einer nach dem anderen, ohne einen einzigen kurzen Satz dazwischen. Genau diese Muster sollte man vor dem Veröffentlichen beseitigen.",
      },
      {
        heading: "Was ein KI-Humanizer macht",
        body: "Ein KI-Humanizer schreibt einen Entwurf von ChatGPT, Claude, Gemini oder einem anderen Modell so um, dass er nach Mensch klingt, nicht nach Maschine. Simply Humanize nutzt eine Überarbeitung in drei Stufen: Zuerst analysiert das Tool die Struktur des Textes (Satzlängen, Wiederholungen, Rhythmus), dann schreibt es ihn um und bricht dabei die statistischen Muster auf, die typisch für KI sind, und zum Schluss folgt ein redaktioneller Feinschliff, damit der Text flüssig zu lesen ist. Bedeutung, Fakten, Zahlen und Namen bleiben erhalten; was sich ändert, ist die Umsetzung: Schachtelsätze werden geteilt, Floskelübergänge verschwinden, aufgeblähtes Vokabular wird wieder normale Sprache, und der Rhythmus wechselt zwischen langen und kurzen Sätzen, so wie Menschen schreiben.",
      },
      {
        heading: "So machen Sie Ihren KI-Text menschlich",
        steps: [
          "Fügen Sie Ihren KI-generierten Text oben ein. Ausgaben von ChatGPT, Claude, Gemini oder jedem anderen Modell funktionieren, zwischen 50 und 20.000 Zeichen.",
          "Klicken Sie auf „Humanize Content“ und warten Sie ein paar Sekunden, während der Text die dreistufige Überarbeitung durchläuft.",
          "Prüfen Sie das Ergebnis, vergleichen Sie es mit dem Original und kopieren Sie es. Ergänzen Sie eigene Beispiele und Einschätzungen: Das kann kein Modell liefern.",
        ],
      },
      {
        heading: "Was sich ändert und was bleibt",
        body: "Das Tool schreibt die Form um, nicht den Inhalt. Fakten, Zahlen, Namen und Argumente bleiben erhalten, ebenso die Gesamtstruktur. Was sich ändert, ist die Erzählweise: weniger Floskeln, weniger gleich lange Sätze, weniger Vorlagen-Vokabular, mehr natürlicher Rhythmus. Das Ergebnis erscheint neben dem Original, sodass Sie beide Fassungen vergleichen können, bevor Sie etwas kopieren. Prüfen Sie die Ausgabe immer, bevor Sie sie verwenden, besonders bei technischen, akademischen oder fachsprachlichen Texten: Die letzte Kontrolle liegt bei Ihnen, wie bei jedem Lektorat.",
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
        q: "Ändert sich die Bedeutung oder ändern sich die Daten?",
        a: "Nein. Fakten, Zahlen, Namen und Argumente bleiben erhalten. Rhythmus, Übergänge und Vokabular ändern sich. Prüfen Sie das Ergebnis trotzdem vor der Veröffentlichung, wie bei jedem Lektorat.",
      },
      {
        q: "Wie viel Text kann ich auf einmal umschreiben?",
        a: "Zwischen 50 und 20.000 Zeichen pro Durchlauf. Sehr lange Dokumente liefern in Abschnitten (Einleitung, Hauptteil, Schluss) bessere Ergebnisse.",
      },
      {
        q: "Funktioniert es für Uni- und Berufstexte?",
        a: "Ja. Hausarbeiten, E-Mails, Berichte, Blogartikel und Produkttexte funktionieren gut. Wenn Ihre Hochschule oder Firma Regeln zum KI-Einsatz hat, halten Sie sich daran.",
      },
      {
        q: "Besteht das Ergebnis KI-Detektoren?",
        a: "Wir machen keine Versprechen zu Detektoren, und das wird so bleiben: Alles andere wäre unseriös. Detektoren ändern sich und irren sich. Das Tool sorgt dafür, dass Ihr Text natürlich klingt und sich besser liest.",
      },
      {
        q: "Ist das Tool auf Deutsch genauso gut wie auf Englisch?",
        a: "Am tiefsten abgestimmt ist das Tool auf Englisch, dort ist die Mustererkennung am stärksten. Bei deutschen Texten liefert es in den meisten Fällen gute Ergebnisse. Testen Sie es kostenlos mit einem echten Text und prüfen Sie die Ausgabe immer, bevor Sie sie verwenden.",
      },
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

  // ─── Portuguese — keyword: "humanizar texto de ia" ──────────────────────────
  {
    slug: "pt",
    hreflang: "pt",
    ogLocale: "pt_BR",
    name: "Portuguese",
    nativeName: "Português",
    lastUpdated: "2026-07-14",
    metaTitle: "Humanizar Texto de IA em Português — Grátis",
    metaDescription:
      "Humanize texto de IA em português, grátis. Cole a saída do ChatGPT, Claude ou Gemini e receba escrita natural em segundos. Sem cadastro e sem cartão.",
    h1: "Humanizar Texto de IA em Português",
    keyword: "humanizar texto de ia",
    hero:
      "Cole o seu texto gerado por IA e receba uma versão com ritmo natural, transições humanas e vocabulário de verdade. O Simply Humanize é um humanizador de texto de IA gratuito: sem conta, sem cartão e com resultado em segundos, direto nesta página.",
    sections: [
      {
        heading: "Como soa o texto de IA em português",
        body: "O texto gerado por IA em português tem sinais próprios, diferentes dos do inglês. Os parágrafos começam quase sempre igual: «Além disso», «No entanto», «Por outro lado». Fórmulas que ninguém usa ao escrever com naturalidade se repetem: «vale ressaltar que», «é importante destacar que», «nos dias de hoje». A estrutura «não apenas... mas também» aparece o tempo todo. O vocabulário incha: tudo é «crucial», «fundamental» ou «essencial», os projetos «alavancam» e «potencializam», e qualquer assunto vira um «panorama» ou um «cenário». E há o ritmo: frases de 25 a 35 palavras, uma atrás da outra, sem uma única frase curta para respirar. Um leitor nativo percebe o padrão mesmo sem saber nomeá-lo. A soma desses sinais é o que faz um texto «soar a IA», e é exatamente isso que vale a pena corrigir antes de publicar.",
      },
      {
        heading: "O que faz um humanizador de texto de IA",
        body: "Um humanizador de texto de IA reescreve um rascunho gerado pelo ChatGPT, Claude, Gemini ou qualquer outro modelo para que soe como pessoa, não como máquina. O Simply Humanize aplica uma reescrita em três etapas: primeiro analisa a estrutura do texto (comprimento das frases, repetições, ritmo), depois o reescreve quebrando os padrões estatísticos típicos da IA, e por fim aplica um acabamento editorial para a leitura fluir. O significado, os fatos, os números e os nomes se conservam; o que muda é a entrega: frases longas são divididas, transições de modelo desaparecem, vocabulário inflado volta a ser linguagem normal, e o ritmo alterna frases longas e curtas, como as pessoas escrevem de verdade.",
      },
      {
        heading: "Como humanizar seu texto em três passos",
        steps: [
          "Cole o texto gerado por IA no campo acima. Funciona com saídas do ChatGPT, Claude, Gemini ou qualquer outro modelo, entre 50 e 20.000 caracteres.",
          "Clique em «Humanize Content» e aguarde alguns segundos enquanto o texto passa pela reescrita em três etapas.",
          "Revise o resultado, compare com o original e copie. Acrescente seus próprios exemplos e opiniões: isso nenhum modelo pode oferecer.",
        ],
      },
      {
        heading: "O que muda e o que permanece",
        body: "A ferramenta reescreve a forma, não o conteúdo. Seus dados, números, nomes e argumentos se conservam, e a estrutura geral também. O que muda é o jeito de contar: menos fórmulas prontas, menos frases do mesmo tamanho, menos vocabulário de modelo, mais ritmo natural. O resultado aparece ao lado do original para você comparar as duas versões antes de copiar qualquer coisa. Revise sempre a saída antes de usar, principalmente em textos técnicos, acadêmicos ou com terminologia muito específica: a revisão final é sua, como com qualquer editor.",
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
        q: "O significado ou os dados do texto vão mudar?",
        a: "Não. Fatos, números, nomes e argumentos se conservam. Mudam o ritmo, as transições e o vocabulário. Ainda assim, revise sempre o resultado antes de publicar, como faria com qualquer editor.",
      },
      {
        q: "Quanto texto posso humanizar de uma vez?",
        a: "Entre 50 e 20.000 caracteres por envio. Para documentos muito longos, divida em seções (introdução, desenvolvimento, conclusão) e o resultado será melhor.",
      },
      {
        q: "Funciona com textos acadêmicos e profissionais?",
        a: "Sim. Trabalhos, e-mails, relatórios, artigos de blog e descrições de produto funcionam bem. Se a sua instituição ou empresa tem regras sobre uso de IA, siga essas regras.",
      },
      {
        q: "O resultado vai passar em um detector de IA?",
        a: "Não fazemos promessas sobre detectores, e nunca faremos: seria uma afirmação irresponsável. Detectores mudam e erram. O que a ferramenta faz é deixar seu texto natural e mais agradável de ler.",
      },
      {
        q: "Funciona tão bem em português quanto em inglês?",
        a: "A ferramenta é mais afinada em inglês, onde a detecção de padrões é mais profunda. Com texto em português, dá bons resultados na maioria dos casos. Teste grátis com um texto real e revise sempre a saída antes de usar.",
      },
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
];

/**
 * hreflang map shared by the homepage and every language page so the
 * alternate cluster can never drift. Every page in the cluster must list
 * all members including itself; English is the x-default.
 *
 * @param {string} siteUrl origin (with or without trailing slash)
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
