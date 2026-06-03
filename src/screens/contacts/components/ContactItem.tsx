import React, { memo } from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common';
import { CaretRight } from '@/svg-icons';
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
          'flex flex-row items-center pl-4',
          pressed ? 'bg-blue-50' : isDark ? 'bg-grayDark-50' : 'bg-white',
        )
      }>
      <Animated.View style={tailwind.style('py-[14px]')}>
        <Avatar size="lg" name={name || ''} src={thumbnail ? { uri: thumbnail } : undefined} />
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 pr-4 py-[14px] flex flex-row items-center border-b-[1px]',
          isDark ? 'border-b-grayDark-200' : 'border-b-gray-100',
        )}>
        <Animated.View style={tailwind.style('flex-1 mr-2')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-[15px] font-inter-580-24 leading-[21px]',
              isDark ? 'text-grayDark-950' : 'text-gray-950',
            )}>
            {name || '—'}
          </Animated.Text>
          {subtitle ? (
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'text-[13px] font-inter-normal-20 leading-[18px] mt-[3px]',
                isDark ? 'text-grayDark-600' : 'text-gray-500',
              )}>
              {subtitle}
            </Animated.Text>
          ) : null}
        </Animated.View>
        <View style={tailwind.style('w-5 h-5')}>
          <CaretRight stroke={isDark ? '#6b7280' : '#d1d5db'} />
        </View>
      </Animated.View>
    </Pressable>
  );
});
