import React from 'react';
import Animated from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Avatar } from '@/components-next';
import { tailwind } from '@/theme';
import type { NotificationType } from '@/types/Notification';
import { ConversationPriority } from '@/types/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { PriorityIndicator, ChannelIndicator } from '@/components-next/list-components';

import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { NotificationTypeIndicator } from './NotificationTypeIndicator';
import { Dimensions } from 'react-native';

type InboxItemProps = {
  isRead: boolean;
  conversationId: number;
  sender: {
    name: string;
    thumbnail: string;
  };
  assignee: {
    name: string;
    thumbnail: string;
  };
  lastActivityAt: () => string;
  priority?: ConversationPriority | null;
  inbox: Inbox | null;
  additionalAttributes: ConversationAdditionalAttributes;
  pushMessageTitle: string;
  notificationType: NotificationType;
};

const { width } = Dimensions.get('screen');

export const InboxItemComponent = (props: InboxItemProps) => {
  const {
    isRead,
    inbox,
    assignee,
    conversationId,
    sender,
    lastActivityAt,
    priority,
    additionalAttributes,
    pushMessageTitle,
    notificationType,
  } = props;

  useColorScheme();
  const hasAssignee = assignee?.name || assignee?.thumbnail;

  const isUnread = !isRead;

  return (
    <Animated.View style={tailwind.style(
      `mx-3 mb-2 rounded-2xl overflow-hidden py-3 ${isUnread ? 'bg-blue-50 dark:bg-blueDark-200 border-l-[3px] border-l-blue-700 dark:border-l-blueDark-600 pl-[9px] pr-3' : 'bg-white dark:bg-grayDark-100 px-3 border border-gray-200 dark:border-grayDark-300'}`
    )}>
      <AnimatedNativeView
        style={tailwind.style('flex flex-row justify-between items-center h-[24px]')}>
        <AnimatedNativeView
          style={tailwind.style('flex flex-row items-center h-[24px] gap-[5px]')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              `text-lg ${isUnread ? 'font-inter-semibold-20' : 'font-inter-medium-24'} tracking-[0.24px] text-gray-950 dark:text-grayDark-950 capitalize`,
              `max-w-[${width - 250}px]`,
            )}>
            {sender.name || ''}
          </Animated.Text>
          <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
            <Animated.Text style={tailwind.style('text-sm font-inter-420-20 text-gray-400 dark:text-grayDark-600')}>
              #
            </Animated.Text>
            <Animated.Text style={tailwind.style('text-sm font-inter-420-20 text-gray-400 dark:text-grayDark-600')}>
              {conversationId}
            </Animated.Text>
          </NativeView>
        </AnimatedNativeView>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-2')}>
          {priority ? <PriorityIndicator {...{ priority }} /> : null}
          {inbox && (
            <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />
          )}
          <NativeView>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-500 dark:text-grayDark-700',
              )}>
              {lastActivityAt()}
            </Animated.Text>
          </NativeView>
        </AnimatedNativeView>
      </AnimatedNativeView>

      <Animated.View style={tailwind.style('flex flex-row justify-between mt-1.5')}>
        <Animated.View style={tailwind.style('flex flex-row items-center gap-1.5 flex-1')}>
          {hasAssignee && (
            <Avatar
              src={assignee.thumbnail ? { uri: assignee.thumbnail } : undefined}
              size="md"
              name={assignee?.name || ''}
            />
          )}

          <Animated.Text
            style={tailwind.style(
              `text-md ${isUnread ? 'font-inter-medium-24 text-gray-800 dark:text-grayDark-900' : 'font-inter-420-20 text-gray-500 dark:text-grayDark-700'} leading-[17px] tracking-[0.32px] flex-shrink`,
            )}
            numberOfLines={1}
            ellipsizeMode="tail">
            {pushMessageTitle}
          </Animated.Text>
        </Animated.View>
        <NotificationTypeIndicator type={notificationType} />
      </Animated.View>
    </Animated.View>
  );
};

InboxItemComponent.displayName = 'InboxItem';
export const InboxItem = React.memo(InboxItemComponent);
