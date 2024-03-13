import { UserType } from "@prisma/client";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) {
          return false;
        }

        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token.isAdmin;
        } else if (req.nextUrl.pathname.startsWith("/judge")) {
          return token.userType == UserType.JUDGE;
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
