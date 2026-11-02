import { SubmersiblePart } from '../types/user';

export const INITIAL_SUBMERSIBLE_PARTS: SubmersiblePart[] = [
  // HULLS
  {
    id: 'hull-nautilus-prime',
    category: 'hull',
    name: 'Nautilus Prime',
    description: 'Reinforced titanium alloy with acoustic sound-dampening panels. Standard research vessel.',
    costCredits: 0,
    levelRequired: 1,
    isUnlocked: true,
    accentColor: '#3FF2E6',
    bonusStat: 'Balanced depth rating',
    iconName: 'Ship'
  },
  {
    id: 'hull-abyssal-mantis',
    category: 'hull',
    name: 'Abyssal Mantis X-1',
    description: 'Hydrodynamic carbon-composite hull crafted for swift descent through midnight ocean canyons.',
    costCredits: 250,
    levelRequired: 3,
    isUnlocked: false,
    accentColor: '#5CC8FF',
    bonusStat: '+15% Descent Velocity',
    iconName: 'Compass'
  },
  {
    id: 'hull-hadal-ghost',
    category: 'hull',
    name: 'Hadal Ghost Phantom',
    description: 'Translucent pressurized crystal hull with living bioluminescent conduits.',
    costCredits: 600,
    levelRequired: 5,
    isUnlocked: false,
    accentColor: '#9B7BFF',
    bonusStat: 'Maximum pressure immunity',
    iconName: 'Shield'
  },
  {
    id: 'hull-leviathan-titan',
    category: 'hull',
    name: 'Leviathan Sovereign',
    description: 'Ancient bio-mechanical hull fused with deep trench minerals and coral resonance.',
    costCredits: 1200,
    levelRequired: 8,
    isUnlocked: false,
    accentColor: '#FF6B9A',
    bonusStat: 'Apex explorer status',
    iconName: 'Zap'
  },

  // PROPULSION
  {
    id: 'prop-standard-hydro',
    category: 'propulsion',
    name: 'Dual Hydro-Jet 400',
    description: 'Reliable twin ducted water jet propulsion for calm twilight waters.',
    costCredits: 0,
    levelRequired: 1,
    isUnlocked: true,
    bonusStat: 'Base maneuverability',
    iconName: 'Wind'
  },
  {
    id: 'prop-ion-magneto',
    category: 'propulsion',
    name: 'Magnetohydrodynamic Drive',
    description: 'Silent propulsion that moves seawater via electromagnetic fields without moving blades.',
    costCredits: 200,
    levelRequired: 2,
    isUnlocked: false,
    bonusStat: 'Silent operation & smooth gliding',
    iconName: 'Cpu'
  },
  {
    id: 'prop-quantum-vortex',
    category: 'propulsion',
    name: 'Quantum Vortex Thrusters',
    description: 'Micro-cavitation vortex impellers capable of pushing through crushing hadal currents.',
    costCredits: 500,
    levelRequired: 6,
    isUnlocked: false,
    bonusStat: 'Trench current stabilization',
    iconName: 'Activity'
  },

  // TOOLS
  {
    id: 'tool-sonar-scanner',
    category: 'tool',
    name: 'Multibeam Sonar Array',
    description: 'High-frequency echolocation scanner that detects hidden reef chambers and submerged secrets.',
    costCredits: 0,
    levelRequired: 1,
    isUnlocked: true,
    bonusStat: 'Detailed reef minimap telemetry',
    iconName: 'Radio'
  },
  {
    id: 'tool-biolume-collector',
    category: 'tool',
    name: 'Luminescent Sample Collector',
    description: 'Cryogenic micro-manipulator arm for harvesting bioluminescent flora and idea crystals.',
    costCredits: 180,
    levelRequired: 3,
    isUnlocked: false,
    bonusStat: '+10% XP on lesson completion',
    iconName: 'Feather'
  },
  {
    id: 'tool-thermal-laser',
    category: 'tool',
    name: 'Hydrothermal Core Laser',
    description: 'Focused blue-laser drill for extracting knowledge fossils from ancient seabed strata.',
    costCredits: 450,
    levelRequired: 5,
    isUnlocked: false,
    bonusStat: 'Unlocks Hadal bonus archives',
    iconName: 'Crosshair'
  },

  // TRAILS
  {
    id: 'trail-cyan-wake',
    category: 'trail',
    name: 'Cyan Plankton Wake',
    description: 'Gentle stream of turquoise bioluminescent micro-particles following your submersible.',
    costCredits: 0,
    levelRequired: 1,
    isUnlocked: true,
    accentColor: '#3FF2E6',
    iconName: 'Sparkles'
  },
  {
    id: 'trail-violet-aurora',
    category: 'trail',
    name: 'Jellyfish Violet Aurora',
    description: 'Silken undulating ribbons of deep violet light pulsing behind your thrusters.',
    costCredits: 150,
    levelRequired: 2,
    isUnlocked: false,
    accentColor: '#9B7BFF',
    iconName: 'Sparkles'
  },
  {
    id: 'trail-plankton-green',
    category: 'trail',
    name: 'Emerald Plankton Bloom',
    description: 'Swirling luminous green particulate wake released during acceleration.',
    costCredits: 300,
    levelRequired: 4,
    isUnlocked: false,
    accentColor: '#7CFFB2',
    iconName: 'Sparkles'
  },

  // THEMES
  {
    id: 'theme-abyss-default',
    category: 'theme',
    name: 'Abyss Command Standard',
    description: 'Deep navy and bioluminescent cyan tactical command cockpit styling.',
    costCredits: 0,
    levelRequired: 1,
    isUnlocked: true,
    accentColor: '#3FF2E6',
    iconName: 'Eye'
  },
  {
    id: 'theme-hadal-amber',
    category: 'theme',
    name: 'Coral Ember Tactical',
    description: 'High-contrast warm coral and gold indicators for intense deep-dive operations.',
    costCredits: 220,
    levelRequired: 4,
    isUnlocked: false,
    accentColor: '#FF6B9A',
    iconName: 'Flame'
  }
];
