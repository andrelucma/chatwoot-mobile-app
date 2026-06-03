import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { selectContactById } from '@/store/contact/contactSelectors';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { UserIcon, PhoneIcon, MapIcon, CompanyIcon, EmailIcon } from '@/svg-icons';
import i18n from '@/i18n';

type RouteProps = RouteProp<TabBarExcludedScreenParamList, 'ContactFormScreen'>;

type FieldKey = 'name' | 'email' | 'phoneNumber' | 'companyName' | 'location';

type FieldConfig = {
  key: FieldKey;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  required?: boolean;
};

const FIELDS: FieldConfig[] = [
  { key: 'name', label: i18n.t('CONTACTS.NAME'), placeholder: i18n.t('CONTACTS.NAME_PLACEHOLDER'), keyboardType: 'default', required: true },
  { key: 'email', label: i18n.t('CONTACTS.EMAIL'), placeholder: i18n.t('CONTACTS.EMAIL_PLACEHOLDER'), keyboardType: 'email-address' },
  { key: 'phoneNumber', label: i18n.t('CONTACTS.PHONE'), placeholder: i18n.t('CONTACTS.PHONE_PLACEHOLDER'), keyboardType: 'phone-pad' },
  { key: 'companyName', label: i18n.t('CONTACTS.COMPANY'), placeholder: i18n.t('CONTACTS.COMPANY_PLACEHOLDER'), keyboardType: 'default' },
  { key: 'location', label: i18n.t('CONTACTS.LOCATION'), placeholder: i18n.t('CONTACTS.LOCATION_PLACEHOLDER'), keyboardType: 'default' },
];

const FIELD_ICONS: Record<FieldKey, React.ReactNode> = {
  name: <UserIcon stroke="#1D4ED8" />,
  email: <EmailIcon />,
  phoneNumber: <PhoneIcon stroke="#1D4ED8" strokeWidth={1.5} />,
  companyName: <CompanyIcon />,
  location: <MapIcon fill="#1D4ED8" />,
};

const ContactFormScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const { contactId } = route.params || {};
  const isEdit = !!contactId;
  const existingContact = useAppSelector(state =>
    contactId ? selectContactById(state, contactId) : null,
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '+55',
    companyName: '',
    location: 'Brasil',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingContact) {
      setForm({
        name: existingContact.name || '',
        email: existingContact.email || '',
        phoneNumber: existingContact.phoneNumber || '',
        companyName: existingContact.additionalAttributes?.companyName || '',
        location: existingContact.additionalAttributes?.location || '',
      });
    }
  }, [existingContact]);

  const handleChange = useCallback((key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.NAME_REQUIRED'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        additionalAttributes: {
          companyName: form.companyName.trim() || undefined,
          location: form.location.trim() || undefined,
        },
      };

      if (isEdit && contactId) {
        await dispatch(contactActions.updateContact({ contactId, ...payload })).unwrap();
      } else {
        await dispatch(contactActions.createContact(payload)).unwrap();
      }
      navigation.dispatch(StackActions.pop());
    } catch (err) {
      const msg = (typeof err === 'string' && err) ? err : i18n.t('CONTACTS.SAVE_ERROR');
      Alert.alert(i18n.t('CONTACTS.ERROR'), msg);
    } finally {
      setSaving(false);
    }
  }, [contactId, dispatch, form, isEdit, navigation]);

  return (
    <KeyboardAvoidingView
      style={tailwind.style('flex-1')}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Blue header */}
      <Animated.View
        style={tailwind.style(
          `bg-blue-800 px-4 pb-5 ${Platform.OS === 'android' ? 'pt-12' : 'pt-14'}`,
        )}>
        <Animated.View style={tailwind.style('flex flex-row items-center justify-between')}>
          <Pressable onPress={() => navigation.dispatch(StackActions.pop())} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-base text-white opacity-80')}>
              {i18n.t('CONTACTS.CANCEL')}
            </Animated.Text>
          </Pressable>
          <Animated.Text style={tailwind.style('text-lg font-inter-580-24 text-white')}>
            {isEdit ? i18n.t('CONTACTS.EDIT_CONTACT') : i18n.t('CONTACTS.NEW_CONTACT')}
          </Animated.Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-medium-24',
                saving ? 'text-blue-300' : 'text-white',
              )}>
              {i18n.t('CONTACTS.SAVE')}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Body */}
      <Animated.View style={tailwind.style('flex-1', isDark ? 'bg-grayDark-100' : 'bg-gray-50')}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={tailwind.style('px-4 pt-5 pb-12')}>

          {/* Fields card */}
          <Animated.View
            style={tailwind.style(
              'rounded-2xl overflow-hidden',
              isDark ? 'bg-grayDark-50' : 'bg-white',
            )}>
            {FIELDS.map((field, index) => (
              <Animated.View key={field.key}>
                {index > 0 && (
                  <Animated.View
                    style={tailwind.style(
                      'h-[1px] ml-[60px]',
                      isDark ? 'bg-grayDark-200' : 'bg-gray-100',
                    )}
                  />
                )}
                <Animated.View style={tailwind.style('flex flex-row items-start px-4 py-[14px]')}>
                  <View
                    style={tailwind.style(
                      'w-9 h-9 rounded-xl items-center justify-center mr-3 mt-[2px]',
                      isDark ? 'bg-blueDark-200' : 'bg-blue-50',
                    )}>
                    {FIELD_ICONS[field.key]}
                  </View>
                  <Animated.View style={tailwind.style('flex-1')}>
                    <Animated.View style={tailwind.style('flex flex-row items-center')}>
                      <Animated.Text
                        style={tailwind.style(
                          'text-[11px] font-inter-medium-24 tracking-[0.6px] uppercase',
                          isDark ? 'text-grayDark-600' : 'text-gray-400',
                        )}>
                        {field.label}
                      </Animated.Text>
                      {field.required && (
                        <Animated.Text style={tailwind.style('text-[11px] text-red-500 ml-[3px] mt-[-1px]')}>
                          *
                        </Animated.Text>
                      )}
                    </Animated.View>
                    <TextInput
                      value={form[field.key]}
                      onChangeText={text => handleChange(field.key, text)}
                      placeholder={field.placeholder}
                      placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                      keyboardType={field.keyboardType || 'default'}
                      autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                      style={tailwind.style(
                        'text-[15px] font-inter-normal-20 py-[5px] mt-[2px]',
                        isDark ? 'text-grayDark-950' : 'text-gray-900',
                      )}
                    />
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) =>
              tailwind.style(
                'mt-5 py-[15px] rounded-2xl items-center justify-center bg-blue-800',
                saving ? 'opacity-50' : pressed ? 'opacity-75' : '',
              )
            }>
            <Animated.Text style={tailwind.style('text-base font-inter-580-24 text-white tracking-[0.2px]')}>
              {saving ? i18n.t('CONTACTS.SAVING') : i18n.t('CONTACTS.SAVE')}
            </Animated.Text>
          </Pressable>

        </ScrollView>
      </Animated.View>

    </KeyboardAvoidingView>
  );
};

export default ContactFormScreen;
