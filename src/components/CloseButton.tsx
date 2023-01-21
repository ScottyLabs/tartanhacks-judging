import { useRouter } from "next/router";

export default function CloseButton() {
  const router = useRouter();
  return (
    <button className="self-end pr-8 absolute" onClick={() => router.push("/")}>
      <svg
        className="h-9 w-9"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
