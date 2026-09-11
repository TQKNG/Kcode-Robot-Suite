import "./globals.css";

export const metadata = {
  title: { default: "Kcode-Robot-Suite", template: "%s | Kcode-Robot-Suite" },
  description: "Extensible Kcode plugin platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
