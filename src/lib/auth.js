import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function CustomPrismaAdapter(p) {
  const adapter = PrismaAdapter(p)
  return {
    ...adapter,
    linkAccount: ({ refresh_token_expires_in, ...account }) => adapter.linkAccount(account),
    createUser: async (data) => {
      // Generate unique referral code on user creation
      let code = generateReferralCode()
      let attempts = 0
      while (attempts < 10) {
        const exists = await p.user.findUnique({ where: { referralCode: code } })
        if (!exists) break
        code = generateReferralCode()
        attempts++
      }
      return adapter.createUser({ ...data, referralCode: code })
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
          scope: 'openid email profile https://www.googleapis.com/auth/business.manage',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan
        token.agencyName = user.agencyName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.plan = token.plan
        session.user.agencyName = token.agencyName
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      return 'https://www.nebulaseo.com/dashboard'
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
