import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  let hostname = req.headers.get("host") || "localhost:3000";
  const domainWithoutPort = hostname.split(':')[0];
  const rootDomainWithoutPort = "localhost";

  // Production domains
  const PROD_DOMAINS = [
    "courtflowapp.com",
    "www.courtflowapp.com",
    "courtflowapp.site",
    "www.courtflowapp.site",
  ];

  if (url.pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  // Treat localhost, production domains, AND Vercel preview URLs as the main site
  // This prevents the app from interpreting the domain as a club subdomain
  if (
    domainWithoutPort === rootDomainWithoutPort ||
    PROD_DOMAINS.includes(hostname) ||
    PROD_DOMAINS.includes(domainWithoutPort) ||
    hostname.includes(".vercel.app")
  ) {
    return NextResponse.next();
  }

  const currentHost = hostname.replace(`:${url.port}`, '');
  const subdomain = currentHost.split('.')[0];
  return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
}
