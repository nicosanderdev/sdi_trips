import { Outlet } from 'react-router-dom';
import { AltFooter } from './AltFooter';
import { AltNavbar } from './AltNavbar';

export function AltLayout() {
  return (
    <div className="alt-site min-h-screen bg-warm-gray">
      <AltNavbar />
      <main className="pt-24">
        <Outlet />
      </main>
      <AltFooter />
    </div>
  );
}
