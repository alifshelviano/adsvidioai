
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Invalid/Missing environment variable: "GOOGLE_CLIENT_ID"')
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "GOOGLE_CLIENT_SECRET"')
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
