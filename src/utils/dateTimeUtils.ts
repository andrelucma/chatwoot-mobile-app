import { fromUnixTime, formatDistanceToNow, isSameDay, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import i18n from '@/i18n';
import { UnixTimestamp } from '@/types';

export const formatRelativeTime = (time: number) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true, locale: ptBR });
};

export const formatTimeToShortForm = (time: string, _withAgo = false) => {
  if (time.includes('menos de um minuto') || time.includes('menos de 30 segundos')) {
    return 'agora';
  }
  return time;
};

export const formatDate = (date: UnixTimestamp, dateFormat = 'MMM dd, yyyy') => {
  const dateObj = fromUnixTime(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(dateObj, today)) {
    return i18n.t('CONVERSATION.TODAY');
  }
  if (isSameDay(dateObj, yesterday)) {
    return i18n.t('CONVERSATION.YESTERDAY');
  }
  return format(dateObj, dateFormat);
};

export const unixTimestampToReadableTime = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  return `${formattedHours}:${minutes} ${ampm}`;
};

export const formatIsoDateTime = (isoString: string) => {
  const dateObj = parseISO(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = format(dateObj, 'HH:mm');

  if (isSameDay(dateObj, today)) {
    return `${i18n.t('CONVERSATION.TODAY')} ${i18n.t('AGENT_STATUS.AT_TIME', { time })}`;
  }
  if (isSameDay(dateObj, yesterday)) {
    return `${i18n.t('CONVERSATION.YESTERDAY')} ${i18n.t('AGENT_STATUS.AT_TIME', { time })}`;
  }
  return `${format(dateObj, 'dd/MM')} ${i18n.t('AGENT_STATUS.AT_TIME', { time })}`;
};

export const messageStamp = ({
  time,
  dateFormat = 'h:mm a',
}: {
  time: number;
  dateFormat?: string;
}) => {
  const unixTime = fromUnixTime(time);
  return format(unixTime, dateFormat);
};
