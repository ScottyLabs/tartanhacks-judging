/**
 * A rotating loading spinner
 */
export default function Spinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center">
      <div
        className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4"
        role="status"
      ></div>
    </div>
  );
}
