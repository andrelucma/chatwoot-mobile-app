import React, { memo } from 'react';
import { View, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { formatIsoDateTime } from '@/utils/dateTimeUtils';
import i18n from '@/i18n';

const STATUS_COLOR: Record<string, string> = {
  online: 'bg-green-800',
  busy: 'bg-yellow-800',
  offline: 'bg-gray-800',
};

type AgentStatusItemProps = {
  agent: Agent;
};

export const AgentStatusItem = memo(({ agent }: AgentStatusItemProps) => {
  const isDark = useColorScheme() === 'dark';
  const { name, email, thumbnail, availabilityStatus, currentSignInAt, lastActivityAt } = agent;

  const status = availabilityStatus || 'offline';
  const isConnected = status === 'online' || status === 'busy';

  const timeLine = isConnected
    ? currentSignInAt &&
      `${i18n.t('AGENT_STATUS.LOGIN_LABEL')} ${formatIsoDateTime(currentSignInAt)}`
    : lastActivityAt
      ? `${i18n.t('AGENT_STATUS.LAST_ACTIVITY_LABEL')} ${formatIsoDateTime(lastActivityAt)}`
      : i18n.t('AGENT_STATUS.NEVER_ACTIVE');

  return (
    <Animated.View
      style={tailwind.style(
        'flex flex-row items-center px-4 py-[14px] border-b-[1px]',
        isDark ? 'bg-grayDark-50 border-b-grayDark-200' : 'bg-white border-b-gray-100',
      )}>
      <Avatar size="lg" name={name || ''} src={thumbnail ? { uri: thumbnail } : undefined} />
      <Animated.View style={tailwind.style('flex-1 ml-3')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-[15px] font-inter-580-24 leading-[21px]',
            isDark ? 'text-grayDark-950' : 'text-gray-950',
          )}>
          {name || '—'}
        </Animated.Text>
        {email ? (
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-[13px] font-inter-normal-20 leading-[18px] mt-[2px]',
              isDark ? 'text-grayDark-600' : 'text-gray-500',
            )}>
            {email}
          </Animated.Text>
        ) : null}
        <Animated.View style={tailwind.style('flex flex-row items-center mt-[6px] gap-[6px]')}>
          <View
            style={tailwind.style(
              'w-[8px] h-[8px] rounded-full',
              STATUS_COLOR[status] || STATUS_COLOR.offline,
            )}
          />
          <Animated.Text
            style={tailwind.style(
              'text-[12px] font-inter-medium-24',
              isDark ? 'text-grayDark-700' : 'text-gray-700',
            )}>
            {i18n.t(`AVAILABILITY.${status.toUpperCase()}`)}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'text-[12px] font-inter-normal-20',
              isDark ? 'text-grayDark-500' : 'text-gray-400',
            )}>
            · {timeLine}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});
