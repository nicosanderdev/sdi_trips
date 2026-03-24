import { Outlet } from 'react-router-dom';
import { AltFooter } from './AltFooter';
import { AltHeader } from './AltHeader';
import { AltNavbar } from './AltNavbar';

export function AltLayout() {
  return (
    <>
      <AltHeader />
      <AltNavbar />
      <main>
        <Outlet />
      </main>
      <AltFooter />
    </>
  );
}
