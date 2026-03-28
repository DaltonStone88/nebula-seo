import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Custom adapter that strips unknown fields Google sends
function CustomPrismaAdapter(prisma) {
  const adapter = PrismaAdapter(prisma)
  return {
    ...adapter,
    linkAccount: ({ refresh_token_expires_in, ...account }) => {
      return adapter.linkAccount(account)
    },
  }
}

export const authOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/business.manage',
          ].join(' '),
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.plan = user.plan
      session.user.agencyName = user.agencyName
      return session
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
