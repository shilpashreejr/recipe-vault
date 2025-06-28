import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex gap-6 items-center py-2">
      <Link href="/" className="font-semibold hover:underline">Home</Link>
      <Link href="/recipes" className="hover:underline">Recipes</Link>
      <Link href="/recipes/upload" className="hover:underline">Upload</Link>
      <Link href="/categories" className="hover:underline">Categories</Link>
      <Link href="/(auth)/login" className="hover:underline">Login</Link>
      <Link href="/(auth)/register" className="hover:underline">Register</Link>
    </nav>
  );
} 