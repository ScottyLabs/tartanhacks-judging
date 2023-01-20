import Link from "next/link";
import Logo from "../../public/svg/logo.svg";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-b from-blue to-purple px-4 pt-4 pb-4 text-beige">
      <Link href="/">
        <Logo className="h-12" />
      </Link>
    </header>
  );
}
