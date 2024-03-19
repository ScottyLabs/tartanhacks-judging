import Link from "next/link";
import Logo from "../../public/svg/logo.svg";
import { signOut } from "next-auth/react";

interface Props {
  hideAuth?: boolean;
  showAdmin?: boolean;
}

export default function Header({ hideAuth = false, showAdmin = false }: Props) {
  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-black py-2 shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-2">
          <div id="mobile-menu-2">
            <Link href="/">
              <Logo className="h-12" />
            </Link>
          </div>
          <div className="flex flex-row gap-8">
            {showAdmin && (
              <Link href="/admin" className="text-white">
                Admin
              </Link>
            )}
            {!hideAuth && (
              <a href="#" onClick={() => void signOut()} className="text-white">
                Sign out
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
