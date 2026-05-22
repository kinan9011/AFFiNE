import { TextDirection } from '@blocksuite/affine-model';
import type { TemplateResult } from 'lit';
import { html } from 'lit';

export interface TextDirectionConfig {
  textDirection: TextDirection;
  name: string;
  hotkey: string[] | null;
  icon: TemplateResult<1>;
}

const LtrIcon = () =>
  html`<svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 5h9M3 8h9M3 11h6"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M15 7l3 3-3 3M18 10H11"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;

const RtlIcon = () =>
  html`<svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 5H8M17 8H8M17 11h-6"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M5 7L2 10l3 3M2 10h7"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;

export const textDirectionConfigs: TextDirectionConfig[] = [
  {
    textDirection: TextDirection.LTR,
    name: 'Left to right',
    hotkey: ['Mod-Shift-,'],
    icon: LtrIcon(),
  },
  {
    textDirection: TextDirection.RTL,
    name: 'Right to left',
    hotkey: ['Mod-Shift-.'],
    icon: RtlIcon(),
  },
];
