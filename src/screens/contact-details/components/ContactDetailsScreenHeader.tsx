import React from 'react';
import { Platform, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Icon, Avatar } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

type ContactDetailsScreenHeaderProps = {
  name: string;
  thumbnail: string;
  bio: string;
};

export const ContactDetailsScreenHeader = (props: ContactDetailsScreenHeaderProps) => {
  const navigation = useNavigation();
  const { name, thumbnail, bio } = props;

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  return (
    <Animated.View
      style={tailwind.style(
        `bg-blue-800 pb-7 ${Platform.OS === 'android' ? 'pt-12' : 'pt-10'}`,
      )}>
      <Animated.View style={tailwind.style('flex flex-row items-center px-4 pb-3')}>
        <Pressable hitSlop={16} onPress={handleBackPress} style={tailwind.style('w-8 h-8 items-center justify-center')}>
          <Icon icon={<CloseIcon stroke="white" />} size={22} />
        </Pressable>
        <Animated.View style={tailwind.style('flex-1')} />
      </Animated.View>
      <Animated.View style={tailwind.style('items-center px-6')}>
        <Avatar size="4xl" src={thumbnail ? { uri: thumbnail } : undefined} name={name} />
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('text-[21px] font-inter-580-24 text-white mt-4')}>
          {name}
        </Animated.Text>
        {bio ? (
          <Animated.Text
            numberOfLines={2}
            style={tailwind.style('text-[13px] font-inter-420-20 text-blue-200 mt-1 text-center leading-[18px]')}>
            {bio}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
