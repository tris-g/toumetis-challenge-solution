import { Link } from 'react-router-dom';
import { MdAccountCircle } from "react-icons/md";

/**
 * Component for rendering a navbar.
 */
export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-3 shadow-md flex items-center justify-between">
      <Link to="/" className="text-lg font-bold">
        <img src="/toumetis-logo.svg" alt="Toumetis Logo" className="h-8 w-auto" />
      </Link>
      <div className="flex items-center gap-4">
        <MdAccountCircle className="text-4xl leading-none" />
      </div>
    </nav>
  );
}