/**
 * Affyne Labs — Content Configuration
 * Single source of truth for all website copy.
 *
 * Grounded in authentic company purpose:
 * Human Understanding Intelligence, exploring the intersection of
 * artificial intelligence, human communication, and wellbeing.
 */

const CONTENT = {

  brand: {
    name: "Affyne Labs",
    tagline: "Technology that understands people.",
  },

  nav: {
    links: [
      { label: "The Problem", href: "#problem" },
      { label: "Mission",     href: "#mission" },
      { label: "Perspective", href: "#perspective" },
      { label: "Intelligence", href: "#intelligence" },
      { label: "The Journey", href: "#storytelling" },
      { label: "Principles", href: "#principles" },
    ],
    cta: { label: "Get in touch", href: "#contact" },
  },

  hero: {
    kickerBrand: "Affyne Labs",
    kickerContext: "HealthTech Innovation // Research & Understanding",
    headline: "Technology that\nunderstands people.",
    body: "Affyne Labs is exploring the intersection of artificial intelligence, human communication, and wellbeing. We develop technology that looks beyond isolated words to interpret context, emotional nuance, and evolving personal states — starting with mental health.",
    primaryCta: { label: "Explore our approach", href: "#problem" },
    image: "assets/hero_human_understanding.jpg",
    imageAlt: "Authentic human conversation in a naturally lit, calm modern room, showing genuine listening and empathetic connection",
  },

  problem: {
    eyebrow: "The Human Problem",
    heading: "People cannot be understood through isolated data.",
    lead: "Standard digital systems treat human expression as transactions — keywords, queries, and surface metrics. But human communication is fundamentally nuanced.",
    body: "What a person says is shaped by whom they are speaking with, what happened yesterday, how their tone shifts under stress, and the unspoken thoughts they cannot put into words.\n\nWhen technology ignores context and measures people against rigid, generic formulas, it fails to understand the person.",
    dimensions: [
      {
        num: "01",
        label: "Context & Setting",
        desc: "A single sentence carries vastly different weight depending on when, where, and why it is shared."
      },
      {
        num: "02",
        label: "Emotion & Cadence",
        desc: "Hesitation, tone, and vocal nuance convey what words alone often leave concealed."
      },
      {
        num: "03",
        label: "Longitudinal History",
        desc: "True understanding requires knowing an individual's personal baseline over time, not a population average."
      }
    ]
  },

  // PRESERVED & CENTRALLY POSITIONED: Mission Section
  mission: {
    eyebrow: "Our mission",
    statement: "To make technology understand people more deeply, and use that understanding to support human connection more meaningfully.",
    body: "Technology has become increasingly capable of processing information — but people are more than information. Context, emotion, relationships, behaviour, and history all shape what someone communicates. Affyne Labs exists to account for these dimensions, responsibly."
  },

  perspective: {
    eyebrow: "Who We Are",
    heading: "Affinity meets intelligence.",
    quote: "We are not defined by a single product. We are defined by a question — how much can technology truly understand about a person?",
    body: "The name Affyne is built from two foundational ideas: Affinity — human connection, trust, and empathy — and Intelligence — the capacity to perceive, interpret, and recognise patterns in context. Labs reflects our methodology: grounded scientific inquiry, clinical collaboration, and responsible, iterative engineering.",
    pillars: [
      {
        num: "01",
        term: "Affinity",
        desc: "Human connection, trust, and empathy. The indispensable foundation of all interpersonal understanding."
      },
      {
        num: "02",
        term: "Intelligence",
        desc: "The capacity to perceive and recognise patterns in context — listening beyond surface vocabulary to emotional cadence and evolving baselines."
      },
      {
        num: "03",
        term: "Labs",
        desc: "How we build: through grounded scientific inquiry, clinical psychologist collaboration, and responsible, iterative engineering."
      }
    ]
  },

  intelligence: {
    eyebrow: "Our Focus",
    heading: "Human Understanding Intelligence.",
    intro: "We are building towards technology capable of interpreting human communication, context, behaviour, and evolving states — in ways that enable more meaningful human experiences and support. Mental health is our first domain of application. It is not the limit of what we intend to explore.",
    featureHeading: "Understanding what lies behind a conversation.",
    featureParagraph1: "Mental health is one of the clearest areas where there is a gap between what a person experiences and what they are able or willing to say out loud. We are exploring how technology can understand what lies behind a conversation — not to replace human care, but to make support more contextual, timely, and personal.",
    featureParagraph2: "Our first product direction is designed to understand a person's communication across conversation, voice, emotion, intent, context, and longitudinal patterns — using that understanding to provide supportive context and facilitate professional care when required.",
    image: "assets/clinical_care_escalation.jpg",
    imageAlt: "Clinical psychologist in consultation setting with patient, in an earnest dialogue in daylight"
  },

  storytelling: {
    eyebrow: "The Progression of Understanding",
    heading: "From isolated information to meaningful connection.",
    stages: [
      {
        num: "01",
        phase: "01 / The Surface",
        title: "People are more than isolated data.",
        body: "Standard digital systems capture fragments: words, clicks, and discrete responses. But human feelings and life experiences cannot be reduced to a single data point or symptom checklist.",
        image: "assets/story_isolated_data.jpg",
        alt: "A woman in quiet contemplation by a window with soft natural morning light"
      },
      {
        num: "02",
        phase: "02 / The Context",
        title: "Context changes what information means.",
        body: "The same words spoken on an ordinary afternoon carry a completely different meaning after days of strain. Tone, pacing, environmental pressures, and personal history give words their true weight.",
        image: "assets/story_human_context.jpg",
        alt: "A person writing in a notebook at a sunlit wooden desk with tea"
      },
      {
        num: "03",
        phase: "03 / The Attunement",
        title: "Understanding requires attention to the person.",
        body: "Genuine comprehension begins with attuned listening. It means noticing what is communicated and what remains unsaid, learning an individual's unique baseline rather than scoring them against generic averages.",
        image: "assets/story_deep_listening.jpg",
        alt: "Two people sitting in a serene room engaged in deep listening and dialogue"
      },
      {
        num: "04",
        phase: "04 / The Outcome",
        title: "Technology in service of human connection.",
        body: "The ultimate purpose of artificial intelligence is not to replace human relationships, but to give individuals and caregivers the clarity, presence, and empathy to connect more deeply with one another.",
        image: "assets/story_meaningful_connection.jpg",
        alt: "A group of people sharing a heartfelt, authentic conversation in an airy courtyard"
      }
    ]
  },

  principles: {
    eyebrow: "What We Believe",
    heading: "Three principles that guide everything.",
    items: [
      {
        num: "01",
        title: "People are more than the words they say.",
        body: "Communication carries layers that spoken or written words alone cannot convey — tone, context, pattern, history, and what is left unsaid. Technology that listens only to words misses what matters most."
      },
      {
        num: "02",
        title: "Understanding should come before intervention.",
        body: "Acting without understanding risks harm. We believe in building deep contextual awareness first — so that any support offered is appropriate, timely, and genuinely helpful to the individual."
      },
      {
        num: "03",
        title: "Technology should augment human connection, not replace it.",
        body: "The goal is not to substitute human care with software. It is to make human care more informed, more accessible, and more responsive — by giving it better context at the right moment."
      }
    ]
  },

  // PRESERVED: Contact CTA Section
  contact: {
    eyebrow: "Get in touch",
    heading: "If this resonates,\nwe would like to hear from you.",
    body: "Whether you are a potential collaborator, an institution interested in our research direction, a clinician with a perspective to share, or someone who simply believes in what we are building — reach out.",
    cta: { label: "Start a conversation", href: "mailto:hello@affynelabs.com" }
  },

  footer: {
    tagline: "Affinity + Intelligence",
    links: [
      { label: "The Problem", href: "#problem" },
      { label: "Mission", href: "#mission" },
      { label: "Perspective", href: "#perspective" },
      { label: "Intelligence", href: "#intelligence" },
      { label: "The Journey", href: "#storytelling" },
      { label: "Principles", href: "#principles" },
      { label: "Contact", href: "#contact" }
    ],
    legal: "© 2026 Affyne Labs. All rights reserved.",
    subtext: "Psychology with Healthcare • Research & Engineering"
  }
};
