import React from 'react';
import { Text, useColorScheme } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const isDark = useColorScheme() === 'dark';
  const { id } = props;
  const textStyle = `text-sm font-inter-420-20 ${isDark ? 'text-grayDark-600' : 'text-gray-400'}`;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
      <Text style={tailwind.style(textStyle)}>#</Text>
      <Text style={tailwind.style(textStyle)}>{id}</Text>
    </NativeView>
  );
};

ConversationId.displayName = 'ConversationId';
