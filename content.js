/**
 * Affyne Labs — Content Configuration
 * Single source of truth for all website copy.
 *
 * Source: Affyne Labs Brand & Team Overview
 */

const CONTENT = {

  brand: {
    name: "Affyne Labs",
    tagline: "Technology that understands people.",
  },

  nav: {
    links: [
      { label: "About",       href: "#about"       },
      { label: "Mission",     href: "#mission"     },
      { label: "Vision",      href: "#vision"      },
      { label: "Exploration", href: "#exploration" },
      { label: "Product",     href: "#product"     },
      { label: "Beliefs",     href: "#beliefs"     },
      { label: "Contact",     href: "#contact"     },
    ],
    cta: { label: "Get in touch", href: "#contact" },
  },

  hero: {
    eyebrow: "HealthTech Innovation",
    headline: "Technology that\nunderstands people.",
    body: "We are a HealthTech innovation company exploring the intersection of artificial intelligence, human understanding, and wellbeing — starting with mental health, with ambitions that reach further.",
    primaryCta:   { label: "Explore our approach", href: "#about"   },
    secondaryCta: { label: "Get in touch",          href: "#contact" },
  },

  about: {
    eyebrow: "Who we are",
    heading: "Affinity meets intelligence.",
    body: "The name Affyne is built from two ideas: Affinity — human connection, trust, and empathy — and Intelligence — the ability to perceive, understand, and recognise patterns in context. Labs reflects how we work: through exploration, experimentation, research, and iteration. We are not defined by a single product. We are defined by a question — how much can technology truly understand about a person?",
    link: { label: "Our mission and vision", href: "#vision" },
  },

  mission: {
    eyebrow: "Our mission",
    statement: "To make technology understand people more deeply, and use that understanding to support human connection more meaningfully.",
    body: "Technology has become increasingly capable of processing information — but people are more than information. Context, emotion, relationships, behaviour, and history all shape what someone communicates. Affyne Labs exists to account for these dimensions, responsibly.",
  },

  vision: {
    eyebrow: "Our vision",
    heading: "Human Understanding Intelligence.",
    body: "We are building towards technology capable of interpreting human communication, context, behaviour, and evolving states — in ways that enable more meaningful human experiences and support. Mental health is our first domain of application. It is not the limit of what we intend to explore.",
    buildingLabel: "Where we begin",
    buildingHeading: "Understanding what lies behind a conversation.",
    buildingBody: "Our first product direction is designed to understand a person's communication across conversation, voice, emotion, intent, context, personal baseline, and longitudinal patterns — and to use that understanding to provide personalised support, appropriate interventions, and human or professional escalation when required.\n\nMental health is one of the clearest areas where there is a gap between what a person experiences and what they are able or willing to say out loud. We are exploring how technology can understand what lies behind a conversation — not to replace human care, but to make support more contextual, timely, and personal.",
  },

  exploration: {
    eyebrow: "Research Dimensions",
    heading: "Grounded inquiry into human expression.",
    intro: "Understanding people requires examining layers beyond literal words — acoustic prosody, longitudinal baseline drift, relational context, and clinical guardrails.",
    cards: [
      {
        number: "01",
        category: "Acoustic Prosody",
        title: "Perceiving vocal cadence and micro-hesitation",
        body: "Authentic dialogue carries acoustic signals that vocabulary alone obscures. Our speech research analyzes pitch variation, micro-pauses, and vocal timbre in real time to perceive genuine emotional state.",
        image: "assets/exploration_acoustics.jpg",
        alt: "Speech acoustic research laboratory with high-fidelity microphone and spectrogram frequency monitor"
      },
      {
        number: "02",
        category: "Longitudinal Norms",
        title: "Tracking individual baselines over time",
        body: "People differ in how they communicate under stress. Rather than measuring individuals against population averages, our engine maps each person's unique multi-week baseline to detect meaningful personal deviations.",
        image: "assets/exploration_longitudinal.jpg",
        alt: "Clinical researchers reviewing longitudinal baseline trend line data on a digital workstation"
      },
      {
        number: "03",
        category: "Contextual Stratification",
        title: "Decoupling overt words from unspoken intent",
        body: "Communication is shaped by relational history, situational pressure, and what someone cannot bring themselves to say out loud. We build contextual models that account for these human dimensions.",
        image: "assets/vision_research_notes.jpg",
        alt: "Research materials, paralinguistic frequency printouts, and clinical psychology annotations"
      },
      {
        number: "04",
        category: "Clinical Guardrails",
        title: "Augmenting human care with ethical boundaries",
        body: "Software must never replace certified human clinical support. Our architecture enforces strict real-time safety thresholds, automatically escalating complex risk signals directly to human clinicians.",
        image: "assets/hero_research_workspace.jpg",
        alt: "Modern technology workstation with research documentation and speech analysis software"
      }
    ]
  },

  product: {
    eyebrow: "Our product",
    heading: "Built for depth, context, and clinical safety.",
    intro: "A conversational intelligence platform that bridges the gap between what someone experiences and what they can put into words — turning everyday dialogue into structured, clinically relevant understanding.",
    pillars: [
      {
        number: "01",
        title: "Multimodal Signal Perception",
        body: "Listens beyond literal vocabulary. Analyzes conversational cadence, acoustic vocal tone, emotional nuance, and deliberate hesitation to understand authentic intent in real time.",
      },
      {
        number: "02",
        title: "Longitudinal Context Engine",
        body: "Builds a personalized baseline over days and weeks. Rather than scoring users against generic population averages, it detects meaningful deviations from a person's individual emotional norm.",
      },
      {
        number: "03",
        title: "Clinical Guardrails & Escalation",
        body: "Provides empathetic micro-interventions in the moment while maintaining strict safety boundaries. Automatically surfaces longitudinal context to care professionals when human escalation is required.",
      },
    ],
  },

  beliefs: {
    eyebrow: "What we believe",
    heading: "Three principles that guide everything.",
    items: [
      {
        number: "01",
        title: "People are more than the words they say.",
        body: "Communication carries layers that spoken or written words alone cannot convey — tone, context, pattern, history, and what is left unsaid. Technology that listens only to words misses what matters most.",
      },
      {
        number: "02",
        title: "Understanding should come before intervention.",
        body: "Acting without understanding risks harm. We believe in building deep contextual awareness first — so that any support offered is appropriate, timely, and genuinely helpful to the individual.",
      },
      {
        number: "03",
        title: "Technology should augment human connection, not replace it.",
        body: "The goal is not to substitute human care with software. It is to make human care more informed, more accessible, and more responsive — by giving it better context at the right moment.",
      },
    ],
  },

  contact: {
    eyebrow: "Get in touch",
    heading: "If this resonates, we would like to hear from you.",
    body: "Whether you are a potential collaborator, an institution interested in our research direction, a clinician with a perspective to share, or someone who simply believes in what we are building — reach out.",
    cta: { label: "Start a conversation", href: "mailto:hello@affynelabs.com" },
  },

  footer: {
    tagline: "Affinity + Intelligence",
    links: [
      { label: "About",       href: "#about"       },
      { label: "Vision",      href: "#vision"      },
      { label: "Exploration", href: "#exploration" },
      { label: "Product",     href: "#product"     },
      { label: "Beliefs",     href: "#beliefs"     },
      { label: "Contact",     href: "#contact"     },
    ],
    legal: "© 2026 Affyne Labs. All rights reserved.",
  },

};
