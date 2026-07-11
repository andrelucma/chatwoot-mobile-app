import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const ContactsIconOutline = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Circle cx="24.5" cy="8" r="5" stroke="#171717" strokeWidth="1.5" />
    <Path
      d="M14 26C14 20.477 18.701 16 24.5 16C30.299 16 35 20.477 35 26"
      stroke="#171717"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const ContactsIconFilled = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Circle cx="24.5" cy="8" r="5" fill="#171717" />
    <Path
      d="M14 26C14 20.477 18.701 16 24.5 16C30.299 16 35 20.477 35 26"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);
