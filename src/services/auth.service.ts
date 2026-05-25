import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;

    // Manually upsert the profile immediately after signup
    // because the DB trigger may have a slight delay.
    // Wrap in try-catch so unauthenticated signups (e.g. when email confirmation is enabled)
    // do not crash the signup process.
    if (data.user) {
      try {
        await (supabase.from('profiles') as any).upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Manual profile upsert skipped (handled by DB trigger):', err);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async ensureProfile(userId: string, email: string, fullName: string) {
    const { data, error } = await (supabase.from('profiles') as any).upsert({
      id: userId,
      email,
      full_name: fullName,
    }, { onConflict: 'id' }).select().maybeSingle();
    if (error) throw error;
    return data as any;
  }
};
