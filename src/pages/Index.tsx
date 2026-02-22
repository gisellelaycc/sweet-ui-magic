import { WizardLayout } from '../components/twin-matrix/WizardLayout';
import { SiteFooter } from '../components/twin-matrix/SiteFooter';

const Index = () => (
  <div className="w-full overflow-y-auto" style={{ background: 'hsl(228 14% 4%)', color: 'hsl(225 14% 93%)' }}>
    <div className="min-h-screen">
      <WizardLayout />
    </div>
    <SiteFooter />
  </div>
);

export default Index;
