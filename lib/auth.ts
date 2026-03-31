import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getSupabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Upsert user in Supabase on sign-in
      try {
        const supabaseAdmin = getSupabaseAdmin()
        await supabaseAdmin.from('users').upsert(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.image,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
        )
      } catch {
        // Supabase not configured — sign-in still proceeds
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
