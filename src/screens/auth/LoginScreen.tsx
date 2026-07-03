import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Image, Keyboard, Platform, Pressable, StatusBar, TextInput, View, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMAIL_REGEX } from '@/constants';
import { EyeIcon, EyeSlash, LockIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { resetAuth } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  LanguageList,
  Button,
  Icon,
  AuthButton,
} from '@/components-next';
import {
  selectInstallationUrl,
  selectBaseUrl,
  selectLocale,
} from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { setLocale } from '@/store/settings/settingsSlice';
import { useRefsContext } from '@/context/RefsContext';
import { SsoUtils } from '@/utils/ssoUtils';

type FormData = {
  email: string;
  password: string;
};

const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { languagesModalSheetRef } = useRefsContext();
  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardShown(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardShown(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const dispatch = useAppDispatch();
  const isLoggingIn = useAppSelector(selectIsLoggingIn);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const baseUrl = useAppSelector(selectBaseUrl);
  const activeLocale = useAppSelector(selectLocale);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    // Clear any existing auth state before login
    dispatch(resetAuth());

    try {
      const result = await dispatch(authActions.login({ email, password })).unwrap();

      // Check if MFA is required in the response
      if ('mfa_required' in result && result.mfa_required) {
        // Navigate directly to MFA screen with the token
        navigation.navigate('MFAScreen' as never);
      }
      // If MFA not required, the auth state will be updated and
      // the app will automatically navigate to the dashboard
    } catch {
      // Login error is handled by Redux and displayed in the UI
    }
  };

  // TODO: Change this condition based on EE check
  // Show SSO login button only if installation URL contains app.chatwoot.com
  const showSsoLogin = installationUrl.includes('app.chatwoot.com');

  const openResetPassword = () => {
    navigation.navigate('ResetPassword' as never);
  };

  const openConfigInstallationURL = () => {
    navigation.navigate('ConfigureURL' as never);
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const handleSsoLogin = async () => {
    if (!installationUrl) {
      return;
    }

    try {
      const result = await SsoUtils.loginWithSSO(installationUrl);

      if (result.type === 'success' && result.url) {
        const ssoParams = SsoUtils.parseCallbackUrl(result.url);
        await SsoUtils.handleSsoCallback(ssoParams, dispatch);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // SSO login error handled silently
    }
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style(`flex-1 ${isDark ? 'bg-grayDark-100' : 'bg-blue-800'}`)}>
      <StatusBar
        translucent
        backgroundColor={isDark ? tailwind.color('bg-grayDark-100') : '#1e40af'}
        barStyle="light-content"
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={tailwind.style('flex-1')}
        contentContainerStyle={tailwind.style('flex-grow')}>

          {/* Brand hero — esconde quando teclado está visível */}
          {!keyboardShown && (
            <View style={tailwind.style(`items-center pt-10 pb-8 px-6 ${isDark ? 'bg-grayDark-100' : 'bg-blue-800'}`)}>
              <Image
                // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
                source={require('@/assets/images/logo.png')}
                style={tailwind.style('w-16 h-16')}
                resizeMode="contain"
              />
              <Animated.Text style={tailwind.style('text-[26px] font-inter-580-24 text-white mt-4')}>
                {i18n.t('LOGIN.TITLE')}
              </Animated.Text>
              <Animated.Text
                style={tailwind.style('text-[14px] font-inter-normal-20 text-blue-200 mt-1 text-center')}>
                {i18n.t('LOGIN.DESCRIPTION', { baseUrl })}
              </Animated.Text>
            </View>
          )}

          {/* Form card */}
          <View style={tailwind.style(`rounded-t-[28px] px-6 pt-8 pb-8 ${isDark ? 'bg-grayDark-100' : 'bg-white'}`)}>

          {showSsoLogin && (
            <View>
              <AuthButton
                text={i18n.t('LOGIN.LOGIN_VIA_SSO')}
                icon={<LockIcon />}
                handlePress={handleSsoLogin}
                disabled={isLoggingIn}
                variant="outline"
              />

              <View style={tailwind.style('flex-row items-center my-6')}>
                <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
                <Animated.Text style={tailwind.style('px-4 text-sm text-gray-600')}>
                  OR
                </Animated.Text>
                <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
              </View>
            </View>
          )}

          <Controller
            control={control}
            rules={{
              required: i18n.t('LOGIN.EMAIL_REQUIRED'),
              pattern: {
                value: EMAIL_REGEX,
                message: i18n.t('LOGIN.EMAIL_ERROR'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('pt-2 gap-2')}>
                <Animated.Text style={tailwind.style('font-inter-420-20 text-gray-950')}>
                  {i18n.t('LOGIN.EMAIL')}
                </Animated.Text>
                <TextInput
                  testID="login-email-input"
                  style={[
                    tailwind.style(
                      'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                      'py-2 px-3 rounded-xl text-gray-950 bg-blackA-A4',
                      'h-10',
                    ),
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={tailwind.color('text-gray-900')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Animated.Text style={tailwind.style('font-inter-normal-20 text-ruby-900')}>
                    {errors.email.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="email"
          />

          <Controller
            control={control}
            rules={{
              required: i18n.t('LOGIN.PASSWORD_REQUIRED'),
              minLength: {
                value: 6,
                message: i18n.t('LOGIN.PASSWORD_ERROR'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('pt-8 gap-2')}>
                <Animated.Text style={tailwind.style('font-inter-420-20  text-gray-950')}>
                  {i18n.t('LOGIN.PASSWORD')}
                </Animated.Text>
                <View style={tailwind.style('relative')}>
                  <TextInput
                    testID="login-password-input"
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        'py-2 pl-3 pr-10 rounded-xl text-gray-950 bg-blackA-A4',
                        'h-10',
                      ),
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    style={tailwind.style('absolute right-4 top-2.5')}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon size={20} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                  </Pressable>
                </View>
                {errors.password && (
                  <Animated.Text style={tailwind.style('text-ruby-900')}>
                    {errors.password.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="password"
          />

          <Pressable style={tailwind.style('pt-1 mb-8')} onPress={openResetPassword}>
            <Animated.Text style={tailwind.style('text-blue-800 font-inter-medium-24 text-right')}>
              {i18n.t('LOGIN.FORGOT_PASSWORD')}
            </Animated.Text>
          </Pressable>

          <Button
            testID="login-submit-button"
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
          />

          <Pressable
            style={tailwind.style('flex-row justify-center items-center mt-4')}
            onPress={() => languagesModalSheetRef.current?.present()}>
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('LOGIN.CHANGE_LANGUAGE')}
            </Animated.Text>
          </Pressable>
          </View>
      </KeyboardAwareScrollView>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default LoginScreen;
