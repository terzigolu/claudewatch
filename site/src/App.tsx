import { Hero } from '@/components/sections/Hero';
import { Demo } from '@/components/sections/Demo';
import { WhyFast } from '@/components/sections/WhyFast';
import { Accurate } from '@/components/sections/Accurate';
import { Install } from '@/components/sections/Install';
import { Footer } from '@/components/sections/Footer';

export default function App() {
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
