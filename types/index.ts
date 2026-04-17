export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodItem {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  fiber_per_100g: number
  sodium_per_100g: number
  is_custom: boolean
}

export interface MealRecord {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  food_item_id: string
  food_item?: FoodItem
  quantity_g: number
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sodium: number
  cost: number | null
  created_at: string
}

export interface UserProfile {
  id: string
  height_cm: number
  weight_kg: number
  age: number
  gender: 'male' | 'female'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  is_muscle_training: boolean
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_fat_goal: number
  daily_carbs_goal: number
}

export interface DailySummary {
  date: string
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  total_fiber: number
  total_sodium: number
  meal_count: number
}
