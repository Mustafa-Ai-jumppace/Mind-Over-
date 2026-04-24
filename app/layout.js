import "./globals.css";

export const metadata = {
  title: "Mind Over Admin",
  description: "Admin dashboard for Mind Over",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
