import { WizardLayout } from '../components/twin-matrix/WizardLayout';
import { SiteFooter } from '../components/twin-matrix/SiteFooter';

const Index = () => (
  <div className="min-h-screen w-full flex flex-col" style={{ background: 'hsl(228 14% 4%)', color: 'hsl(225 14% 93%)' }}>
    <div className="flex-1 min-h-screen overflow-hidden">
      <WizardLayout />
    </div>
    <SiteFooter />
  </div>
);

export default Index;
