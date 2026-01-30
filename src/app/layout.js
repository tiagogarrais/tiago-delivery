import "./globals.css";
import { Providers } from "./providers"; // Importe o componente que criamos

// É aqui que se configura o SEO e a verificação do Google no Next.js novo
export const metadata = {
  title: "Tiago Delivery",
  description: "Uma vitrine virtual para o comércio local",
  verification: {
    google: "D1VrU2-MBaQS5OfUt2DAcErgME0Ht0Tord2YhSdSrYo",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
