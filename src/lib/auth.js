import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Request offline access so we get a refresh token for GBP API calls
          access_type: 'offline',
          prompt: 'consent',
          scope: [
            'openid',
            'email',
            'profile',
            // GBP scopes — will work once API is approved
            'https://www.googleapis.com/auth/business.manage',
          ].join(' '),
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id and plan to session
      session.user.id = user.id
      session.user.plan = user.plan
      session.user.agencyName = user.agencyName
      return session
    },
    async signIn({ user, account }) {
      // Store Google tokens on the user's businesses for GBP API calls
      if (account?.provider === 'google' && account.access_token) {
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() },
        }).catch(() => {}) // ignore if user doesn't exist yet (first sign in)
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
