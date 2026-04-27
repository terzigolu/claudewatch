import { Hero } from '@/components/sections/Hero';
import { Demo } from '@/components/sections/Demo';
import { WhyFast } from '@/components/sections/WhyFast';
import { Accurate } from '@/components/sections/Accurate';
import { Install } from '@/components/sections/Install';
import { Footer } from '@/components/sections/Footer';
import { useSessionTicker } from '@/lib/use-session-ticker';

export default function App() {
  useSessionTicker();

  return (
    <main className="mx-auto max-w-7xl">
      <Hero />
      <Demo />
      <WhyFast />
      <Accurate />
      <Install />
      <Footer />
    </main>
  );
}
