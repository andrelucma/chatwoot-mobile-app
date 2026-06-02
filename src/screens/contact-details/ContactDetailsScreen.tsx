import React, { useEffect, useRef } from 'react';
import { Alert, View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StackActions, useNavigation } from '@react-navigation/native';
import camelCase from 'camelcase';

import { TAB_BAR_HEIGHT } from '@/constants';
import {
  CallIcon,
  EmailIcon,
  LocationIcon,
  CompanyIcon,
  MessengerFilledIcon,
  XFilledIcon,
  TelegramFilledIcon,
  InstagramFilledIcon,
  GithubIcon,
  LinkedinIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { AttributeListType, CustomAttribute, GenericListType } from '@/types';

import {
  ContactDetailsScreenHeader,
  ContactBasicActions,
  ContactMetaInformation,
  ContactLabelActions,
} from './components';
import { AttributeList, Button } from '@/components-next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { contactActions } from '@/store/contact/contactActions';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectContactLabelsByContactId } from '@/store/contact/contactLabelSlice';
import { NewConversationSheet } from '@/screens/contacts/components/NewConversationSheet';
import i18n from '@/i18n';

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const allSocialMediaProfiles: GenericListType[] = [
  {
    icon: <MessengerFilledIcon />,
    subtitle: 'Facebook',
    title: 'Facebook',
    subtitleType: 'dark',
    key: 'facebook',
    link: 'https://fb.com/',
  },
  {
    icon: <XFilledIcon />,
    subtitle: 'Twitter',
    title: 'Twitter',
    subtitleType: 'dark',
    key: 'twitter',
    link: 'https://x.com/',
  },
  {
    icon: <GithubIcon />,
    subtitle: 'Github',
    title: 'Github',
    subtitleType: 'dark',
    key: 'github',
    link: 'https://github.com/',
  },
  {
    icon: <LinkedinIcon />,
    subtitle: 'Linkedin',
    title: 'Linkedin',
    subtitleType: 'dark',
    key: 'linkedin',
    link: 'https://linkedin.com/',
  },
  {
    icon: <InstagramFilledIcon />,
    subtitle: 'Instagram',
    title: 'Instagram',
    subtitleType: 'dark',
    key: 'instagram',
    link: 'https://instagram/',
  },
  {
    icon: <TelegramFilledIcon />,
    subtitle: 'Telegram',
    title: 'Telegram',
    subtitleType: 'dark',
    key: 'telegram',
    link: 'https://t.me/',
  },
];

const processContactAttributes = (
  attributes: CustomAttribute[],
  customAttributes: Record<string, string>,
  filterCondition: (key: string, custom: Record<string, string>) => boolean,
) => {
  if (!attributes.length || !customAttributes) {
    return [];
  }

  return attributes.reduce<(CustomAttribute & { value: string })[]>((result, attribute) => {
    const { attributeKey } = attribute;
    const meetsCondition = filterCondition(camelCase(attributeKey), customAttributes);

    if (meetsCondition) {
      result.push({
        ...attribute,
        value: customAttributes[camelCase(attributeKey)] ?? '',
      });
    }

    return result;
  }, []);
};

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId, contactId: routeContactId, fromContacts } = props.route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const newConversationSheetRef = useRef<BottomSheetModal>(null);

  const conversation = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId) : null,
  );

  const contactIdFromConversation = conversation?.meta?.sender?.id;
  const contactId = routeContactId || contactIdFromConversation;

  const emailFromConversation = conversation?.meta?.sender?.email;
  const nameFromConversation = conversation?.meta?.sender?.name;
  const thumbnailFromConversation = conversation?.meta?.sender?.thumbnail;

  const contact = useAppSelector(state => (contactId ? selectContactById(state, contactId) : null));

  const {
    name: contactName,
    thumbnail: contactThumbnail,
    phoneNumber,
    email: contactEmail,
  } = contact || {};

  const email = emailFromConversation || contactEmail;
  const name = nameFromConversation || contactName;
  const thumbnail = thumbnailFromConversation || contactThumbnail;

  const {
    city,
    country,
    description,
    location = '',
    companyName = '',
    socialProfiles,
    twitterScreenName,
    telegramUsername,
  } = contact?.additionalAttributes || {};

  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  const usedContactCustomAttributes = processContactAttributes(
    contactCustomAttributes,
    contact?.customAttributes || {},
    (key, custom) => key in custom,
  );

  const socialMediaProfiles = {
    twitter: twitterScreenName,
    telegram: telegramUsername,
    ...(socialProfiles || {}),
  };

  const hasContactCustomAttributes = usedContactCustomAttributes.length > 0;

  const contactLabels = useAppSelector(state =>
    contactId ? selectContactLabelsByContactId(contactId)(state) : [],
  );

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
      dispatch(contactActions.getContact(contactId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    if (contactId) {
      navigation.dispatch(StackActions.push('ContactFormScreen', { contactId }));
    }
  };

  const handleDelete = () => {
    if (!contactId) return;
    Alert.alert(
      i18n.t('CONTACTS.DELETE_CONFIRM_TITLE'),
      i18n.t('CONTACTS.DELETE_CONFIRM_MESSAGE'),
      [
        { text: i18n.t('CONTACTS.CANCEL'), style: 'cancel' },
        {
          text: i18n.t('CONTACTS.DELETE'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(contactActions.deleteContact(contactId)).unwrap();
              navigation.dispatch(StackActions.pop());
            } catch {
              Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.DELETE_ERROR'));
            }
          },
        },
      ],
    );
  };

  const handleNewConversation = () => {
    newConversationSheetRef.current?.present();
  };

  const socialMediaDetails = allSocialMediaProfiles
    .filter(profile => socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles])
    .map(profile => ({
      ...profile,
      subtitle: `${profile.link}${socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles]}`,
      type: 'link',
    }));

  const fullLocation =
    location || [city, country].filter(Boolean).join(', ') || null;

  const userDetails: GenericListType[] = [
    {
      icon: <LocationIcon />,
      subtitle: fullLocation || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACTS.LOCATION'),
      subtitleType: 'dark',
    },
    {
      icon: <CallIcon />,
      subtitle: phoneNumber || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACTS.PHONE'),
      subtitleType: 'dark',
    },
    {
      icon: <EmailIcon />,
      subtitle: email || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACTS.EMAIL'),
      subtitleType: 'dark',
    },
    {
      icon: <CompanyIcon />,
      subtitle: companyName || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACTS.COMPANY'),
      subtitleType: 'dark',
    },
  ];

  const allDetails = [...userDetails, ...socialMediaDetails];

  return (
    <BottomSheetModalProvider>
      <View
        style={tailwind.style(
          `flex-1 bg-white pt-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`,
        )}>
        <ContactDetailsScreenHeader
          name={name || contactName || ''}
          thumbnail={thumbnail || contactThumbnail || ''}
          bio={description || ''}
        />
        {fromContacts && contactId ? (
          <Animated.View style={tailwind.style('px-4 pt-4 pb-2 gap-3')}>
            <Button
              text={i18n.t('CONTACTS.NEW_CONVERSATION')}
              handlePress={handleNewConversation}
            />
            <Button
              text={i18n.t('CONTACTS.EDIT')}
              variant="secondary"
              handlePress={handleEdit}
            />
            <Button
              text={i18n.t('CONTACTS.DELETE')}
              variant="secondary"
              isDestructive
              handlePress={handleDelete}
            />
          </Animated.View>
        ) : null}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
          {email || phoneNumber ? (
            <Animated.View style={tailwind.style('mt-[23px] px-4')}>
              <ContactBasicActions phoneNumber={phoneNumber || ''} email={email || ''} />
            </Animated.View>
          ) : null}
          <Animated.View style={tailwind.style('pt-10')}>
            <AttributeList list={allDetails as AttributeListType[]} />
          </Animated.View>
          {hasContactCustomAttributes && (
            <Animated.View style={tailwind.style('pt-10')}>
              <ContactMetaInformation attributes={usedContactCustomAttributes} />
            </Animated.View>
          )}
          {contactId ? (
            <Animated.View style={tailwind.style('pt-10')}>
              <ContactLabelActions labels={contactLabels} contactId={contactId} />
            </Animated.View>
          ) : null}
        </Animated.ScrollView>
      </View>
      {fromContacts && contact ? (
        <NewConversationSheet contact={contact} sheetRef={newConversationSheetRef} />
      ) : null}
    </BottomSheetModalProvider>
  );
};

export default ContactDetailsScreen;
