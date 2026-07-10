import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const AgentStatusIconOutline = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Circle cx="19.5" cy="9" r="4.5" stroke="#171717" strokeWidth="1.5" />
    <Path
      d="M10 26C10 20.925 14.253 17 19.5 17C24.747 17 29 20.925 29 26"
      stroke="#171717"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="30.5" cy="11" r="3.5" stroke="#171717" strokeWidth="1.5" />
    <Path
      d="M33 17.5C36.976 18.55 39.9 21.945 39.9 26"
      stroke="#171717"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const AgentStatusIconFilled = () => (
  <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
    <Circle cx="19.5" cy="9" r="4.5" fill="#171717" />
    <Path
      d="M10 26C10 20.925 14.253 17 19.5 17C24.747 17 29 20.925 29 26"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Circle cx="30.5" cy="11" r="3.5" fill="#171717" />
    <Path
      d="M33 17.5C36.976 18.55 39.9 21.945 39.9 26"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);
