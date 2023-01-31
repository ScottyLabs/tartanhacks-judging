import Link from "next/link";
import Logo from "../../public/svg/logo.svg";
import { signOut } from "next-auth/react";

interface Props {
  hideAuth?: boolean;
}

export default function Header({ hideAuth = false }: Props) {
  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-gradient-to-b from-blue to-purple py-2 shadow-md">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
          {!hideAuth && (
            <div className="flex items-center lg:order-2">
              <a href="#" onClick={() => void signOut()} className="text-white">
                Sign out
              </a>
            </div>
          )}
          <div
            className="hidden w-full items-center justify-between lg:order-1 lg:flex lg:w-auto"
            id="mobile-menu-2"
          >
            <Link href="/">
              <Logo className="h-12" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
