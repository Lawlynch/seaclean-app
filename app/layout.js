import './globals.css';

export const metadata = {
  title: 'SeaClean Portal',
  description: 'Client and Staff Access',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}