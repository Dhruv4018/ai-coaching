"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

// ✅ CREATE COMPANION
export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = await createSupabaseClient(); // ✅ fixed
  console.log("hello main hu",supabase)

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

// ✅ GET ALL COMPANIONS
export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = await createSupabaseClient(); // ✅ fixed

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error.message);

  return companions;
};

// ✅ GET SINGLE COMPANION
export const getCompanion = async (id: string) => {
  const supabase = await createSupabaseClient(); // ✅ fixed

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return data[0];
};

// ✅ ADD TO SESSION HISTORY
export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  const supabase = await createSupabaseClient(); // ✅ fixed

  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data;
};

// ✅ GET RECENT SESSIONS
export const getRecentSessions = async (limit = 10) => {
  const supabase = await createSupabaseClient(); // ✅ fixed

  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

// ✅ GET USER SESSIONS
export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = await createSupabaseClient(); // ✅ fixed

  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

// ✅ GET USER COMPANIONS
export const getUserCompanions = async (userId: string) => {
  const supabase = await createSupabaseClient(); // ✅ fixed

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) throw new Error(error.message);

  return data;
};

// ✅ CHECK PERMISSION TO CREATE COMPANION
export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  const supabase = await createSupabaseClient(); // ✅ fixed

  let limit = 0;

  if (has({ plan: "pro" })) {
    return true;
  } else if (has({ feature: "3_companion_limit" })) {
    limit = 3;
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10;
  }

  const { data, error } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("author", userId);

  if (error) throw new Error(error.message);

  const companionCount = data?.length;

  return companionCount < limit;
};
