import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { request, gql } from "graphql-request";
import { NextApiRequest, NextApiResponse } from "next/types";

const API_SERVER_URL = process.env.API_SERVER_URL || "";

const refreshTokenMutation = gql`
  mutation ($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      exp
    }
  }
`;

const loginMutation = gql`
  mutation ($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      refreshToken
      exp
      user {
        email
        username
        age
        id
      }
    }
  }
`;

async function refreshAccessToken(tokenObject: callbackTokenType) {
  try {
    const { refreshToken } = await request(
      API_SERVER_URL,
      refreshTokenMutation,
      {
        refreshToken: tokenObject.refreshToken,
      }
    );

    return {
      ...tokenObject,
      accessToken: refreshToken.accessToken,
    };
  } catch (error) {
    return {
      ...tokenObject,
      error: "RefreshAccessTokenError",
    };
  }
}

const providers = [
  CredentialsProvider({
    name: "Credentials",
    authorize: async (credentials: any) => {
      try {
        const { login } = await request(API_SERVER_URL, loginMutation, {
          username: credentials.username,
          password: credentials.password,
        });

        if (login.accessToken) {
          return login;
        }

        return null;
      } catch (e) {
        throw new Error(e as string);
      }
    },
    credentials: {},
  }),
];

type callbackTokenType = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  user: {
    username: string;
    email: string;
    age: number;
    id: number;
  };
  exp: number;
  error: string;
};
const callbacks = {
  jwt: async ({
    token,
    user,
  }: {
    token: callbackTokenType;
    user: callbackTokenType;
  }) => {
    if (user) {
      // This will only be executed at login. Each next invocation will skip this part.
      token.accessToken = user.accessToken;
      token.refreshToken = user.refreshToken;
      token.user = user.user;
      token.accessTokenExpiry = Date.now() + user.exp * 1000;
    }

    // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
    // const shouldRefreshTime = Math.round(
    //   token.accessTokenExpiry - 60 * 60 * 1000 - Date.now()
    // );

    if (Date.now() < token.accessTokenExpiry) {
      return Promise.resolve(token);
    }

    // If the token is still valid, just return it.

    // If the call arrives after 23 hours have passed, we allow to refresh the token.

    return Promise.resolve(token);
  },
  session: async ({
    session,
    token,
  }: {
    token: callbackTokenType;
    session: callbackTokenType;
  }) => {
    // Here we pass accessToken to the client to be used in authentication with your API
    session.accessToken = token.accessToken;
    session.accessTokenExpiry = token.accessTokenExpiry;
    session.user = token.user;
    session.error = token.error;

    return Promise.resolve(session);
  },
};

export const options = {
  providers,
  callbacks,
  pages: {},
  secret: process.env.COOKIE_PASSWORD,
};

const Auth = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options as unknown as NextAuthOptions);
export default Auth;
