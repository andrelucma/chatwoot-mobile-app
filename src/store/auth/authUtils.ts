import { AxiosError } from 'axios';
import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';
import type { ApiErrorResponse } from './authTypes';

export const handleApiError = (error: unknown, customErrorMsg?: string) => {
  const { response } = error as AxiosError<ApiErrorResponse>;

  // Handle specific error responses (401, 400, etc.)
  if (response?.status === 401 || response?.status === 400) {
    const { errors } = response.data;
    const responseData = response.data as unknown as { error?: string };
    const apiMessage = errors?.[0] || responseData?.error;
    const message = customErrorMsg || apiMessage || I18n.t('ERRORS.COMMON_ERROR');
    showToast({ message });
    return { success: false, errors: apiMessage ? [apiMessage] : errors };
  }

  const message = customErrorMsg || I18n.t('ERRORS.COMMON_ERROR');
  showToast({ message });
  return { success: false, errors: [message] };
};
