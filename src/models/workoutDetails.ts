// Detailed workout/drill definitions with step-by-step instructions

export interface WorkoutStep {
  stepNumber: number;
  title: string;
  description: string;
  sets?: number; // Number of sets
  reps?: number; // Number of reps per set
  durationSeconds?: number; // Duration in seconds (if timed)
  restSeconds?: number; // Rest between sets in seconds
}

export interface WorkoutDetail {
  id: string;
  title: string;
  category: "perimeter" | "finishing" | "handle";
  goal: string; // What the player will achieve
  skillFocus: string; // Main skill being developed
  estimatedTime: number; // Minutes
  equipment: string[]; // Required equipment
  steps: WorkoutStep[]; // Step-by-step instructions
  coachingCues: string[]; // 3-5 coaching points
  commonMistakes: string[]; // 2-3 common mistakes
  loggingInstructions: string; // How to log this (makes/attempts vs checklist)
}

/**
 * Get detailed workout information
 */
export function getWorkoutDetail(workoutId: string): WorkoutDetail | null {
  const details = WORKOUT_DETAILS[workoutId];
  return details || null;
}

/**
 * All workout details with comprehensive instructions
 */
const WORKOUT_DETAILS: Record<string, WorkoutDetail> = {
  // Perimeter Shooting
  perimeter_1: {
    id: "perimeter_1",
    title: "Ray Allen Corner 3 Series",
    category: "perimeter",
    goal: "Master corner three-point shooting with game-speed catch-and-shoot mechanics",
    skillFocus: "Quick release, perfect form, corner shooting technique",
    estimatedTime: 30,
    equipment: ["Basketball", "Partner (optional)", "Rebounder (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Warm-up: Form Shooting",
        description: "Start close to the rim (5-8 feet) in the corner. Shoot 20 makes focusing on perfect form: square your feet, quick release, follow through.",
        sets: 1,
        reps: 20,
        restSeconds: 0,
      },
      {
        stepNumber: 2,
        title: "Corner 3s - Right Corner",
        description: "Move to the right corner three-point line. Catch-and-shoot 50 shots at game speed. Focus on quick release and maintaining balance.",
        sets: 5,
        reps: 10,
        restSeconds: 60,
      },
      {
        stepNumber: 3,
        title: "Corner 3s - Left Corner",
        description: "Move to the left corner three-point line. Catch-and-shoot 50 shots at game speed. Focus on quick release and maintaining balance.",
        sets: 5,
        reps: 10,
        restSeconds: 60,
      },
      {
        stepNumber: 4,
        title: "Game-Speed Challenge",
        description: "Alternate between corners. Catch, shoot, sprint to other corner, repeat. 20 makes total (10 each corner).",
        sets: 1,
        reps: 20,
        restSeconds: 0,
      },
    ],
    coachingCues: [
      "Catch with your feet already set - don't jump to catch",
      "Quick release: ball should be out of your hands within 0.5 seconds of catch",
      "Maintain wide base - feet shoulder-width apart for stability",
      "Follow through: hold your shooting hand up until ball hits rim",
      "Shoot straight up, not fading away from the basket",
    ],
    commonMistakes: [
      "Rushing the shot before your feet are set",
      "Narrow base causing loss of balance",
    ],
    loggingInstructions: "Log your makes and attempts from each corner. Track your percentage: aim for 40%+ from corners.",
  },
  perimeter_2: {
    id: "perimeter_2",
    title: "Relocation Shooting Drill",
    category: "perimeter",
    goal: "Improve off-ball movement and finding open spots for catch-and-shoot opportunities",
    skillFocus: "Off-ball movement, court awareness, quick relocation",
    estimatedTime: 25,
    equipment: ["Basketball", "Partner (recommended)", "5 cones or markers"],
    steps: [
      {
        stepNumber: 1,
        title: "Set Up Spots",
        description: "Mark 5 spots: right corner, right wing, top of key, left wing, left corner. Start at one spot.",
        sets: 1,
        reps: 1,
        restSeconds: 0,
      },
      {
        stepNumber: 2,
        title: "Shoot and Relocate",
        description: "Shoot from current spot, then immediately sprint to a different spot. Partner passes you the ball. Catch and shoot. Repeat.",
        sets: 5,
        reps: 2, // 2 makes from each of 5 spots = 10 makes total
        restSeconds: 90,
      },
      {
        stepNumber: 3,
        title: "Game-Speed Relocation",
        description: "Increase speed. Shoot, relocate, catch, shoot. No rest between shots. 10 makes total.",
        sets: 1,
        reps: 10,
        restSeconds: 0,
      },
    ],
    coachingCues: [
      "Move immediately after shooting - don't watch your shot",
      "Relocate to open space, not where you just were",
      "Catch with your feet ready to shoot",
      "Keep your eyes on the passer, not the rim, until you catch",
      "Use change of direction - don't run in straight lines",
    ],
    commonMistakes: [
      "Watching your shot instead of relocating immediately",
      "Relocating to the same spot repeatedly",
    ],
    loggingInstructions: "Log total makes and attempts. Track your percentage while moving: aim for 35%+.",
  },
  perimeter_3: {
    id: "perimeter_3",
    title: "1-Dribble Pull-Up Series",
    category: "perimeter",
    goal: "Master creating space with one dribble and shooting off the dribble",
    skillFocus: "Creating space, pull-up jumpers, game-speed moves",
    estimatedTime: 20,
    equipment: ["Basketball", "Partner (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Right Wing Pull-Ups",
        description: "Start at right wing. Catch, one dribble right, pull-up jumper. 20 makes.",
        sets: 4,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 2,
        title: "Left Wing Pull-Ups",
        description: "Start at left wing. Catch, one dribble left, pull-up jumper. 20 makes.",
        sets: 4,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 3,
        title: "Top of Key Pull-Ups",
        description: "Start at top of key. Catch, one dribble (either direction), pull-up jumper. 20 makes.",
        sets: 4,
        reps: 5,
        restSeconds: 45,
      },
    ],
    coachingCues: [
      "Dribble with purpose - create space, don't just dribble",
      "Keep your head up - see the rim before you shoot",
      "Rise up on your shot - use your legs for power",
      "Maintain balance throughout the move",
      "Quick release after the dribble - don't hesitate",
    ],
    commonMistakes: [
      "Dribbling too hard and losing control",
      "Shooting off-balance because you're rushing",
    ],
    loggingInstructions: "Log makes and attempts from each spot. Track your pull-up percentage: aim for 40%+.",
  },
  perimeter_4: {
    id: "perimeter_4",
    title: "Step-Back Three Mastery",
    category: "perimeter",
    goal: "Master the step-back three-pointer and create space for open shots",
    skillFocus: "Creating space, shooting off balance, advanced shot creation",
    estimatedTime: 25,
    equipment: ["Basketball", "Partner or defender (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Form Step-Backs",
        description: "Start at three-point line. Practice step-back move slowly: jab step, step back, shoot. 20 makes focusing on form.",
        sets: 4,
        reps: 5,
        restSeconds: 60,
      },
      {
        stepNumber: 2,
        title: "Game-Speed Step-Backs",
        description: "Increase speed. Step-back threes from various spots (wings, top). 30 makes total.",
        sets: 6,
        reps: 5,
        restSeconds: 60,
      },
    ],
    coachingCues: [
      "Create space first - step back far enough to be open",
      "Maintain balance - don't fall backward",
      "Quick release after stepping back",
      "Use your legs to generate power even when stepping back",
      "Land in a balanced position ready to shoot",
    ],
    commonMistakes: [
      "Stepping back too far and losing balance",
      "Rushing the shot before you're set",
    ],
    loggingInstructions: "Log makes and attempts. Track your step-back percentage: aim for 35%+.",
  },
  perimeter_5: {
    id: "perimeter_5",
    title: "Form Shooting Fundamentals",
    category: "perimeter",
    goal: "Master the fundamental mechanics of shooting form and build muscle memory for perfect technique",
    skillFocus: "Shooting mechanics, balance, alignment, release point, follow-through",
    estimatedTime: 20,
    equipment: ["Basketball"],
    steps: [
      {
        stepNumber: 1,
        title: "Close Range - Right Side",
        description: "Start 3-5 feet from the rim on the right side. Focus on perfect form: feet squared, elbow in, smooth release, full follow-through. 25 makes.",
        sets: 5,
        reps: 5,
        restSeconds: 30,
      },
      {
        stepNumber: 2,
        title: "Close Range - Left Side",
        description: "Move to 3-5 feet from the rim on the left side. Maintain perfect form. 25 makes.",
        sets: 5,
        reps: 5,
        restSeconds: 30,
      },
      {
        stepNumber: 3,
        title: "Free Throw Line Extended",
        description: "Move to free throw line extended (12-15 feet). Focus on using your legs and maintaining form. 25 makes.",
        sets: 5,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 4,
        title: "Elbow Form Shooting",
        description: "Shoot from both elbows (15-18 feet). Focus on consistency and perfect mechanics. 25 makes total (12-13 each side).",
        sets: 5,
        reps: 5,
        restSeconds: 45,
      },
    ],
    coachingCues: [
      "Feet squared to the basket - shoulder-width apart",
      "Bend your knees and use your legs for power",
      "Elbow in line with the basket - don't let it flare out",
      "Smooth, consistent release - same every time",
      "Full follow-through - hold your shooting hand up until the ball hits the rim",
      "Shoot with arc - aim for the back of the rim",
    ],
    commonMistakes: [
      "Rushing shots instead of focusing on form",
      "Not using legs and relying only on arms",
      "Inconsistent release point",
    ],
    loggingInstructions: "Log makes and attempts from each spot. Focus on form over speed. Aim for 80%+ from close range, 70%+ from mid-range.",
  },
  // Finishing Craft
  finishing_1: {
    id: "finishing_1",
    title: "Elite Floater Package",
    category: "finishing",
    goal: "Master floaters from various angles and situations",
    skillFocus: "Mid-range finishing, body control, touch around the rim",
    estimatedTime: 30,
    equipment: ["Basketball", "Cones or defenders (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Right Side Floaters",
        description: "Start at right elbow. Drive to the right side of the key, shoot floater. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 2,
        title: "Left Side Floaters",
        description: "Start at left elbow. Drive to the left side of the key, shoot floater. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 3,
        title: "Straight-On Floaters",
        description: "Start at top of key. Drive straight, shoot floater in the lane. 10 makes.",
        sets: 2,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 4,
        title: "Game-Speed Floaters",
        description: "Full-speed drives from various angles. 10 makes total.",
        sets: 1,
        reps: 10,
        restSeconds: 0,
      },
    ],
    coachingCues: [
      "Use your legs to generate power - don't just arm the shot",
      "Release high - get the ball over defenders",
      "Soft touch - let the ball roll off your fingertips",
      "Finish with both hands - practice with your off-hand too",
      "Body control - maintain balance while shooting",
    ],
    commonMistakes: [
      "Shooting too hard and missing long",
      "Not using your legs for power",
    ],
    loggingInstructions: "Log makes and attempts. Track your floater percentage: aim for 60%+.",
  },
  finishing_2: {
    id: "finishing_2",
    title: "Reverse Layup Mastery",
    category: "finishing",
    goal: "Master reverse layups from both sides with both hands",
    skillFocus: "Advanced finishing, body control, ambidextrous finishing",
    estimatedTime: 25,
    equipment: ["Basketball", "Cones or defenders (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Right Side Reverse (Right Hand)",
        description: "Drive from right side, finish with right hand on left side of rim. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 2,
        title: "Left Side Reverse (Left Hand)",
        description: "Drive from left side, finish with left hand on right side of rim. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 3,
        title: "Game-Speed Reverses",
        description: "Full-speed drives from both sides. 10 makes total.",
        sets: 1,
        reps: 10,
        restSeconds: 0,
      },
    ],
    coachingCues: [
      "Use the backboard - aim for the top corner",
      "Protect the ball - keep it away from defenders",
      "Body control - maintain balance while finishing",
      "Soft touch - don't force it",
      "Practice with both hands equally",
    ],
    commonMistakes: [
      "Not using the backboard effectively",
      "Finishing too hard and missing",
    ],
    loggingInstructions: "Log makes and attempts. Track your reverse layup percentage: aim for 70%+.",
  },
  finishing_3: {
    id: "finishing_3",
    title: "Euro Step & And-1 Finishes",
    category: "finishing",
    goal: "Master advanced finishing moves and finishing through contact",
    skillFocus: "Contact finishing, body control, advanced moves",
    estimatedTime: 30,
    equipment: ["Basketball", "Pads or defender (recommended)"],
    steps: [
      {
        stepNumber: 1,
        title: "Euro Step Practice",
        description: "Practice euro step move: drive, step one way, step other way, finish. 20 makes.",
        sets: 4,
        reps: 5,
        restSeconds: 60,
      },
      {
        stepNumber: 2,
        title: "Spin Move Finishes",
        description: "Practice spin moves into finishes. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 60,
      },
      {
        stepNumber: 3,
        title: "Contact Finishes",
        description: "Finish through contact using pads or defender. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 60,
      },
    ],
    coachingCues: [
      "Change direction quickly - don't telegraph your move",
      "Protect the ball - keep it close to your body",
      "Finish strong - use your body to create space",
      "Land balanced - be ready for contact",
      "Practice both directions equally",
    ],
    commonMistakes: [
      "Telegraphing your move before you make it",
      "Not protecting the ball from defenders",
    ],
    loggingInstructions: "Log makes and attempts. Track your contact finishing percentage: aim for 50%+.",
  },
  finishing_4: {
    id: "finishing_4",
    title: "Inside-Hand Finishes",
    category: "finishing",
    goal: "Master inside-hand finishes around the rim from both sides",
    skillFocus: "Advanced technique, ambidextrous finishing, body control",
    estimatedTime: 25,
    equipment: ["Basketball", "Cones (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Right Side Inside-Hand",
        description: "Drive from right side, finish with right hand on right side of rim (inside-hand). 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 2,
        title: "Left Side Inside-Hand",
        description: "Drive from left side, finish with left hand on left side of rim (inside-hand). 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 45,
      },
      {
        stepNumber: 3,
        title: "Game-Speed Finishes",
        description: "Full-speed drives from both sides. 10 makes total.",
        sets: 1,
        reps: 10,
        restSeconds: 0,
      },
    ],
    coachingCues: [
      "Use the backboard - aim high on the glass",
      "Protect the ball - keep it away from shot blockers",
      "Soft touch - don't force it",
      "Body control - maintain balance",
      "Practice with both hands equally",
    ],
    commonMistakes: [
      "Not using the backboard effectively",
      "Finishing too hard",
    ],
    loggingInstructions: "Log makes and attempts. Track your inside-hand finishing percentage: aim for 65%+.",
  },
  // Handle & Creation
  handle_1: {
    id: "handle_1",
    title: "Pro Combo Moves",
    category: "handle",
    goal: "Master advanced ball-handling moves and combo sequences",
    skillFocus: "Advanced ball handling, change of direction, game-speed moves",
    estimatedTime: 30,
    equipment: ["Basketball", "Cones (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Between-the-Legs Series",
        description: "Full-court between-the-legs dribbling. Focus on control and speed. 3 rounds.",
        sets: 3,
        durationSeconds: 60,
        restSeconds: 30,
      },
      {
        stepNumber: 2,
        title: "Behind-the-Back Series",
        description: "Full-court behind-the-back dribbling. Focus on control and speed. 3 rounds.",
        sets: 3,
        durationSeconds: 60,
        restSeconds: 30,
      },
      {
        stepNumber: 3,
        title: "Combo Moves",
        description: "Combine moves: crossover, between legs, behind back, spin. Full-court. 5 rounds.",
        sets: 5,
        durationSeconds: 45,
        restSeconds: 30,
      },
    ],
    coachingCues: [
      "Keep your head up - see the court",
      "Low dribble - keep the ball close to your body",
      "Quick changes of direction",
      "Use your body to protect the ball",
      "Practice both hands equally",
    ],
    commonMistakes: [
      "Dribbling too high and losing control",
      "Not keeping your head up",
    ],
    loggingInstructions: "Mark this as completed when finished. Focus on control and speed, not makes/attempts.",
  },
  handle_2: {
    id: "handle_2",
    title: "Two-Ball Advanced",
    category: "handle",
    goal: "Master elite two-ball dribbling and coordination",
    skillFocus: "Advanced ball handling, coordination, ambidextrous control",
    estimatedTime: 25,
    equipment: ["2 Basketballs"],
    steps: [
      {
        stepNumber: 1,
        title: "Two-Ball Stationary",
        description: "Stationary two-ball dribbling: same time, alternating, crossovers. 3 minutes.",
        sets: 1,
        durationSeconds: 180,
        restSeconds: 0,
      },
      {
        stepNumber: 2,
        title: "Two-Ball Crossovers",
        description: "Two-ball crossovers while moving. Full-court. 5 rounds.",
        sets: 5,
        durationSeconds: 30,
        restSeconds: 30,
      },
      {
        stepNumber: 3,
        title: "Two-Ball Between Legs",
        description: "Two-ball between-the-legs while moving. Full-court. 5 rounds.",
        sets: 5,
        durationSeconds: 30,
        restSeconds: 30,
      },
    ],
    coachingCues: [
      "Keep both balls low and controlled",
      "Focus on coordination - both hands working together",
      "Start slow, then increase speed",
      "Don't look at the balls - feel them",
      "Practice until it feels natural",
    ],
    commonMistakes: [
      "Looking at the balls instead of keeping head up",
      "Rushing before you have control",
    ],
    loggingInstructions: "Mark this as completed when finished. Focus on control and coordination, not makes/attempts.",
  },
  handle_3: {
    id: "handle_3",
    title: "Game-Speed Handle & Finish",
    category: "handle",
    goal: "Combine ball-handling moves with finishing at the rim",
    skillFocus: "Game-speed moves, finishing, full-court play",
    estimatedTime: 25,
    equipment: ["Basketball", "Cones (optional)"],
    steps: [
      {
        stepNumber: 1,
        title: "Full-Court Combo to Finish",
        description: "Full-court: combo moves (crossover, between legs, behind back), finish at rim. 20 makes.",
        sets: 4,
        reps: 5,
        restSeconds: 60,
      },
      {
        stepNumber: 2,
        title: "Change of Direction Finishes",
        description: "Quick changes of direction, finish at rim. 15 makes.",
        sets: 3,
        reps: 5,
        restSeconds: 60,
      },
    ],
    coachingCues: [
      "Change direction quickly - don't telegraph",
      "Finish strong at the rim",
      "Keep your head up throughout",
      "Use your body to protect the ball",
      "Practice both directions",
    ],
    commonMistakes: [
      "Telegraphing your moves",
      "Not finishing strong at the rim",
    ],
    loggingInstructions: "Log makes and attempts. Track your finishing percentage after moves: aim for 60%+.",
  },
};
