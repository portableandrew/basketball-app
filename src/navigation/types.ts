// Navigation type definitions

export type RootStackParamList = {
  Home: undefined;
  Log: undefined;
  Stats: undefined;
  Workouts: undefined;
  Attributes: undefined;
  Profile: undefined;
  StreakDebug: undefined;
  // Shop: undefined; // Disabled - cosmetics feature temporarily disabled
};

export type HomeStackParamList = {
  HomeMain: undefined;
  LogWorkout: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: string };
};
