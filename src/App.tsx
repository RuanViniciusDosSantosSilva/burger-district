import { Builder } from '@/components/builder/Builder';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Checkout } from '@/components/cart/Checkout';
import { Cursor } from '@/components/layout/Cursor';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileCartBar } from '@/components/layout/MobileCartBar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Preloader } from '@/components/layout/Preloader';
import { Toasts } from '@/components/layout/Toasts';
import { MenuSection } from '@/components/menu/MenuSection';
import { ProductModal } from '@/components/menu/ProductModal';
import { Anatomy } from '@/components/sections/Anatomy';
import { Contact } from '@/components/sections/Contact';
import { Experience } from '@/components/sections/Experience';
import { Favorites } from '@/components/sections/Favorites';
import { Hero } from '@/components/sections/Hero';
import { Location } from '@/components/sections/Location';
import { MarqueeBand } from '@/components/sections/Marquee';
import { Promotions } from '@/components/sections/Promotions';
import { Reviews } from '@/components/sections/Reviews';
import { Story } from '@/components/sections/Story';
import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';

export default function App() {
  return (
    <UIProvider>
      <CartProvider>
        <a href="#cardapio" className="sr-only z-[400] rounded-full bg-ember px-4 py-2 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Pular para o cardápio
        </a>
        <Preloader />
        <Cursor />
        <Header />
        <MobileMenu />
        <main>
          <Hero />
          <MarqueeBand />
          <Story />
          <Anatomy />
          <MenuSection />
          <Favorites />
          <Builder />
          <Promotions />
          <Experience />
          <Reviews />
          <Location />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
        <ProductModal />
        <Checkout />
        <Toasts />
        <MobileCartBar />
      </CartProvider>
    </UIProvider>
  );
}
