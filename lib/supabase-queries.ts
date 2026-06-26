import "server-only"

import { supabase, handleSupabaseError } from "./supabase-server"
import type { User, Team, Match, Matchweek, Prediction } from "./types"

// User queries
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  if (error) handleSupabaseError(error)
  return data as User[]
}

export async function getUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error) handleSupabaseError(error)
  return data as User
}

// Team queries
export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
  if (error) handleSupabaseError(error)
  return data as Team[]
}

export async function getTeam(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) handleSupabaseError(error)
  return data as Team | null
}

// Matchweek queries
export async function getMatchweeks() {
  const { data, error } = await supabase
    .from('matchweeks')
    .select('*')
    .order('number', { ascending: true })
  if (error) handleSupabaseError(error)
  return data as Matchweek[]
}

export async function getMatchweek(id: string) {
  const { data, error } = await supabase
    .from('matchweeks')
    .select('*')
    .eq('id', id)
    .single()
  if (error) handleSupabaseError(error)
  return data as Matchweek
}

export async function getCurrentMatchweek() {
  const { data, error } = await supabase
    .from('matchweeks')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  if (error) handleSupabaseError(error)
  return data as Matchweek | null
}

// Match queries
export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
  if (error) handleSupabaseError(error)
  return data as Match[]
}

export async function getMatchesByMatchweek(matchweekId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('matchweekId', matchweekId)
  if (error) handleSupabaseError(error)
  return (data || []) as Match[]
}

export async function getMatch(id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()
  if (error) handleSupabaseError(error)
  return data as Match
}

// Prediction queries
export async function getPredictions() {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
  if (error) handleSupabaseError(error)
  return data as Prediction[]
}

export async function getPredictionsByUser(userId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('userId', userId)
  if (error) handleSupabaseError(error)
  return data as Prediction[]
}

export async function getPredictionsByMatch(matchId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('matchId', matchId)
  if (error) handleSupabaseError(error)
  return data as Prediction[]
}

export async function getPredictionsByUserAndMatch(userId: string, matchId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('userId', userId)
    .eq('matchId', matchId)
    .single()
  if (error) handleSupabaseError(error)
  return data as Prediction
}

export async function getPredictionsByUserAndMatchweek(userId: string, matchweekId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, matches!inner(*)')
    .eq('userId', userId)
    .eq('matches.matchweekId', matchweekId)
  if (error) handleSupabaseError(error)
  return data as Prediction[]
}

// Mutation functions
export async function updateMatchweek(matchweekId: string, updates: Partial<Matchweek>) {
  const { data, error } = await supabase
    .from('matchweeks')
    .update(updates)
    .eq('id', matchweekId)
    .select()
    .single()
  if (error) handleSupabaseError(error)
  return data as Matchweek
}

export async function updateMatches(matchIds: string[], updates: Partial<Match>) {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .in('id', matchIds)
    .select()
  if (error) handleSupabaseError(error)
  return data as Match[]
}

export async function savePrediction(prediction: Omit<Prediction, "id" | "points">) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({
      ...prediction,
      points: null
    })
    .select()
    .single()
  if (error) handleSupabaseError(error)
  return data as Prediction
}

export async function updateMatchResult(matchId: string, homeScore: number, awayScore: number) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      homeScore,
      awayScore,
      status: 'completed'
    })
    .eq('id', matchId)
    .select()
    .single()
  if (error) handleSupabaseError(error)
  return data as Match
}

// Leaderboard query
export async function getLeaderboardByMatchweek(matchweekId: string) {
  const { data, error } = await supabase
    .rpc('get_matchweek_leaderboard', { matchweek_id: matchweekId })
  if (error) handleSupabaseError(error)
  return data
} 