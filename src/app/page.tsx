'use client';

import React from 'react';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { InvestorLoginModal } from '@/components/InvestorLoginModal';
import { IntroPage } from '@/components/IntroPage';

export default function HomePage() {
  return (
    <>
      <IntroPage />
      <InvestorLoginModal />
      <StickyMobileBar />
    </>
  );
}
