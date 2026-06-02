import React, { memo } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common';
import { tailwind } from '@/theme';
import { Contact } from '@/types';

type ContactItemProps = {
  contact: Contact;
  onPress: (contact: Contact) => void;
};

export const ContactItem = memo(({ contact, onPress }: ContactItemProps) => {
  const isDark = useColorScheme() === 'dark';
  const { name, email, phoneNumber, thumbnail } = contact;

  const subtitle = email || phoneNumber || '';

  return (
    <Pressable
      onPress={() => onPress(contact)}
      style={({ pressed }) =>
        tailwind.style(
          'flex flex-row items-center mx-4 mb-2 px-3 py-3 rounded-2xl border overflow-hidden',
          isDark
            ? 'bg-grayDark-100 border-grayDark-300'
            : 'bg-white border-gray-200',
          pressed ? (isDark ? 'opacity-70' : 'bg-gray-50') : '',
        )
      }>
      <Avatar
        size="md"
        name={name || ''}
        src={thumbnail ? { uri: thumbnail } : undefined}
      />
      <Animated.View style={tailwind.style('flex-1 ml-3')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-[15px] font-inter-medium-24 leading-[20px]',
            isDark ? 'text-grayDark-950' : 'text-gray-900',
          )}>
          {name || '—'}
        </Animated.Text>
        {subtitle ? (
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-[13px] font-inter-normal-20 leading-[18px] mt-[2px]',
              isDark ? 'text-grayDark-600' : 'text-gray-500',
            )}>
            {subtitle}
          </Animated.Text>
        ) : null}
      </Animated.View>
      <Animated.Text
        style={tailwind.style(
          'text-[18px] ml-2',
          isDark ? 'text-grayDark-400' : 'text-gray-300',
        )}>
        ›
      </Animated.Text>
    </Pressable>
  );
});
