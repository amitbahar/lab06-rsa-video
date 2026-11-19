// Scene registry. OWNED BY STEP 0 — do not edit.
import React from 'react';
import {S01Hook} from './S01_Hook';
import {S02KeyExchange} from './S02_KeyExchange';
import {S03TwoKeys} from './S03_TwoKeys';
import {S04Trapdoor} from './S04_Trapdoor';
import {S05KeyGen} from './S05_KeyGen';
import {S06EncryptDecrypt} from './S06_EncryptDecrypt';
import {S07WhyItWorks} from './S07_WhyItWorks';
import {S08Signatures} from './S08_Signatures';
import {S09RealWorld} from './S09_RealWorld';
import {S10Recap} from './S10_Recap';

export const SCENES: {id: string; component: React.FC}[] = [
  {id: 'S01', component: S01Hook},
  {id: 'S02', component: S02KeyExchange},
  {id: 'S03', component: S03TwoKeys},
  {id: 'S04', component: S04Trapdoor},
  {id: 'S05', component: S05KeyGen},
  {id: 'S06', component: S06EncryptDecrypt},
  {id: 'S07', component: S07WhyItWorks},
  {id: 'S08', component: S08Signatures},
  {id: 'S09', component: S09RealWorld},
  {id: 'S10', component: S10Recap},
];
