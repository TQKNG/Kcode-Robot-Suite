import "./globals.css";

export const metadata = {
  title: { default: "Kcode-Robot-Suite", template: "%s | Kcode-Robot-Suite" },
  description: "Extensible Kcode plugin platform",
  icons:{
    icon:'https://cs210032002b3e09a5d.blob.core.windows.net/portfolio-assets/brand/Logo_v3.png',
    shortcut: 'https://cs210032002b3e09a5d.blob.core.windows.net/portfolio-assets/brand/Logo_v3.png',
    apple: 'https://cs210032002b3e09a5d.blob.core.windows.net/portfolio-assets/brand/Logo_v3.png'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
