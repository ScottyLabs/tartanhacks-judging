// import { withAuth, default as loggedIn } from "next-auth/middleware";
// import { UserType } from "@prisma/client";
// import type { NextRequest } from "next/server";

// const adminOnly = withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   function middleware(req) {
//     console.log(req.nextauth.token);
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => {
//         return token?.isAdmin as boolean;
//       },
//     },
//   }
// );

// const judgeOnly = withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   function middleware(req) {
//     console.log(req.nextauth.token);
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => {
//         return token?.userType == UserType.JUDGE;
//       },
//     },
//   }
// );

// const judgeOnlyRoutes = ["/judging"];
// const adminOnlyRoutes = ["/admin", "/results"];
// const loggedInOnlyRoutes = ["/"];

// export function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname in judgeOnlyRoutes) {
//     // This logic is only applied to /about
//     return judgeOnly;
//   } else if (request.nextUrl.pathname in adminOnlyRoutes) {
//     return adminOnly;
//   } else if (request.nextUrl.pathname in loggedInOnlyRoutes) {
//     return loggedIn;
//   }
// }

export { default } from "next-auth/middleware";

export const config = { matcher: ["/", "/results", "/judging"] };
