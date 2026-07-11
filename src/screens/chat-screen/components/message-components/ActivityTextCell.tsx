import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { unixTimestampToReadableTime } from '@/utils/dateTimeUtils';

type ActivityTextCellProps = {
  text: string;
  timeStamp: number;
};

const translateActivityText = (text: string) => {
  return text
    .replace(/\blow\b/gi, 'baixa')
    .replace(/\bmedium\b/gi, 'média')
    .replace(/\bhigh\b/gi, 'alta')
    .replace(/\burgent\b/gi, 'urgente')
    .replace(/\bopen\b/gi, 'aberta')
    .replace(/\bresolved\b/gi, 'resolvida')
    .replace(/\bpending\b/gi, 'pendente')
    .replace(/\bsnoozed\b/gi, 'adiada');
};

export const ActivityTextCell = (props: ActivityTextCellProps) => {
  const { text, timeStamp } = props;
  return (
    <Animated.View style={tailwind.style('flex flex-row flex-wrap justify-center py-1 px-10')}>
      <Animated.Text
        style={tailwind.style(
          'text-cxs font-inter-420-20 tracking-[0.32px] leading-[18px] text-blackA-A11 text-center',
        )}>
        {translateActivityText(text)} {unixTimestampToReadableTime(timeStamp)}
      </Animated.Text>
    </Animated.View>
  );
};
