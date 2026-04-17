import { UserProfile } from '@/types'

export function calculateGoals(profile: Omit<UserProfile, 'id' | 'daily_calorie_goal' | 'daily_protein_goal' | 'daily_fat_goal' | 'daily_carbs_goal'>) {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  // BMR (Mifflin-St Jeor)
  let bmr: number
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
  } else {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161
  }

  const tdee = bmr * activityMultipliers[profile.activity_level]
  const dailyCalorieGoal = Math.round(tdee)

  // 筋トレ仕様: タンパク質 体重×2g、脂質 20%、残り炭水化物
  let proteinGoal: number
  let fatGoal: number
  let carbsGoal: number

  if (profile.is_muscle_training) {
    proteinGoal = Math.round(profile.weight_kg * 2)
    fatGoal = Math.round((dailyCalorieGoal * 0.2) / 9)
    const remainingCalories = dailyCalorieGoal - proteinGoal * 4 - fatGoal * 9
    carbsGoal = Math.round(remainingCalories / 4)
  } else {
    proteinGoal = Math.round((dailyCalorieGoal * 0.15) / 4)
    fatGoal = Math.round((dailyCalorieGoal * 0.25) / 9)
    carbsGoal = Math.round((dailyCalorieGoal * 0.6) / 4)
  }

  return {
    daily_calorie_goal: dailyCalorieGoal,
    daily_protein_goal: proteinGoal,
    daily_fat_goal: fatGoal,
    daily_carbs_goal: carbsGoal,
  }
}
