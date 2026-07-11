import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const AgentStatusIconOutline = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Path
      d="M14 21V18C14 11.373 18.925 6 25 6C31.075 6 36 11.373 36 18V21"
      stroke="#171717"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Rect x="10.5" y="19.5" width="7" height="11" rx="3.5" stroke="#171717" strokeWidth="1.5" />
    <Rect x="31.5" y="19.5" width="7" height="11" rx="3.5" stroke="#171717" strokeWidth="1.5" />
    <Path
      d="M35 30.5V32C35 34.209 30.5 36 26 36"
      stroke="#171717"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="25" cy="36" r="1.6" fill="#171717" />
  </Svg>
);

export const AgentStatusIconFilled = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Path
      d="M14 21V18C14 11.373 18.925 6 25 6C31.075 6 36 11.373 36 18V21"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Rect x="10.5" y="19.5" width="7" height="11" rx="3.5" fill="#171717" />
    <Rect x="31.5" y="19.5" width="7" height="11" rx="3.5" fill="#171717" />
    <Path
      d="M35 30.5V32C35 34.209 30.5 36 26 36"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Circle cx="25" cy="36" r="1.8" fill="#171717" />
  </Svg>
);
