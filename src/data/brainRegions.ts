export interface BrainRegion {
  id: string;
  name: string;
  description: string;
  functions: string[];
  category: string;
}

export const brainRegions: BrainRegion[] = [
  {
    id: "prefrontal",
    name: "Prefrontal Cortex",
    description: "Helps you hold a goal in mind, weigh options, and plan what comes next. The prefrontal cortex works with many other brain regions to support flexible thinking, working memory, and social behavior.",
    functions: ["Planning", "Decision-making", "Problem-solving", "Personality", "Working memory"],
    category: "Frontal Lobe",
  },
  {
    id: "motor",
    name: "Primary Motor Cortex",
    description: "A strip of cortex just in front of the central sulcus that helps send commands for voluntary movement. Each hemisphere mainly controls the opposite side of the body, working with other motor areas, the basal ganglia, and cerebellum.",
    functions: ["Voluntary movement", "Movement execution", "Fine motor control"],
    category: "Frontal Lobe",
  },
  {
    id: "sensory",
    name: "Primary Somatosensory Cortex",
    description: "Just behind the central sulcus, this region helps you sense touch and the position of your body. Its body map gives more space to sensitive areas such as your hands and lips.",
    functions: ["Touch processing", "Temperature sensing", "Pain perception", "Body awareness"],
    category: "Parietal Lobe",
  },
  {
    id: "visual",
    name: "Visual Cortex",
    description: "Visual areas at the back of the brain begin making sense of signals from your eyes. They work with wider networks to help you recognize shapes, colors, motion, and depth.",
    functions: ["Color processing", "Shape recognition", "Motion detection", "Depth perception"],
    category: "Occipital Lobe",
  },
  {
    id: "auditory",
    name: "Auditory Cortex",
    description: "Tucked into the upper temporal lobe, auditory cortex helps analyze sounds. Its primary area responds to features such as frequency, while surrounding networks help you recognize speech, music, and the world around you.",
    functions: ["Sound processing", "Speech recognition", "Music perception", "Sound localization"],
    category: "Temporal Lobe",
  },
  {
    id: "broca",
    name: "Broca's Area",
    description: "Usually in the left inferior frontal cortex, this region contributes to producing and organizing language. It works within a wider language network; it is not a single, independent speech center.",
    functions: ["Speech production", "Language processing", "Grammar", "Verbal fluency"],
    category: "Frontal Lobe",
  },
  {
    id: "wernicke",
    name: "Wernicke's Area",
    description: "A traditional name for a language-related region near the back of the left superior temporal cortex. Understanding language relies on a broader network, and the exact boundaries of this area are debated.",
    functions: ["Language comprehension", "Reading", "Semantic processing", "Word recognition"],
    category: "Temporal Lobe",
  },
  {
    id: "hippocampus",
    name: "Hippocampus",
    description: "A curved structure deep in each temporal lobe that helps form new memories of events and places. It links pieces of an experience and supports navigation, learning, and memory consolidation.",
    functions: ["Memory formation", "Spatial navigation", "Learning", "Memory consolidation"],
    category: "Limbic System",
  },
  {
    id: "amygdala",
    name: "Amygdala",
    description: "A group of nuclei near the front of each hippocampus that helps evaluate emotionally significant information. It contributes to learning about threats and rewards and to forming emotional memories.",
    functions: ["Emotion processing", "Fear response", "Emotional memory", "Threat detection"],
    category: "Limbic System",
  },
  {
    id: "cerebellum",
    name: "Cerebellum",
    description: "The richly folded ‘little brain’ beneath the back of the cerebrum helps fine-tune movement, balance, and timing. It also participates in learning and several cognitive processes.",
    functions: ["Motor coordination", "Balance", "Motor learning", "Timing"],
    category: "Hindbrain",
  },
  {
    id: "thalamus",
    name: "Thalamus",
    description: "A paired collection of nuclei near the center of the brain that helps route and regulate information reaching the cortex. Different nuclei participate in sensation, movement, attention, and sleep–wake activity.",
    functions: ["Sensory relay", "Consciousness", "Sleep regulation", "Attention"],
    category: "Diencephalon",
  },
  {
    id: "hypothalamus",
    name: "Hypothalamus",
    description: "A small region below the thalamus that helps keep your internal conditions stable. It regulates hunger, thirst, temperature, daily rhythms, and hormone release through connections with the pituitary gland.",
    functions: ["Hunger regulation", "Temperature control", "Hormone regulation", "Sleep cycles"],
    category: "Diencephalon",
  },
  {
    id: "brainstem",
    name: "Brain Stem",
    description: "The midbrain, pons, and medulla form the brainstem. Together they connect the brain and spinal cord and support breathing, circulation, arousal, and many movements and sensations of the head and face.",
    functions: ["Breathing control", "Heart rate", "Blood pressure", "Consciousness"],
    category: "Brainstem",
  },
  {
    id: "parietal",
    name: "Parietal Lobe",
    description: "Brings together information about your body and the space around you. It includes primary somatosensory cortex and supports attention, visually guided action, spatial reasoning, and aspects of number processing.",
    functions: ["Spatial processing", "Navigation", "Math reasoning", "Sensory integration"],
    category: "Parietal Lobe",
  },
  {
    id: "temporal",
    name: "Temporal Lobe",
    description: "Along the sides of the brain, the temporal lobes support hearing, recognition, and aspects of language. Their medial structures, including the hippocampus and amygdala, contribute to memory and emotional learning.",
    functions: ["Auditory processing", "Memory", "Face recognition", "Language"],
    category: "Temporal Lobe",
  },
];

export const getRegionById = (id: string): BrainRegion | undefined => {
  return brainRegions.find(r => r.id === id);
};
