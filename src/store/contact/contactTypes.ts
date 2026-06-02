import { Contact, Conversation } from '@/types';
import { Inbox } from '@/types/Inbox';

export interface ContactListMeta {
  count: number;
  currentPage: number;
}

export interface ContactListAPIResponse {
  meta: { count: number; current_page: number };
  payload: Contact[];
}

export interface ContactListResponse {
  meta: ContactListMeta;
  contacts: Contact[];
}

export interface SearchContactsPayload {
  q: string;
  page?: number;
}

export interface CreateContactPayload {
  inboxId?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  identifier?: string;
  additionalAttributes?: {
    companyName?: string;
    location?: string;
    city?: string;
    country?: string;
  };
}

export interface UpdateContactPayload {
  contactId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  identifier?: string;
  additionalAttributes?: {
    companyName?: string;
    location?: string;
    city?: string;
    country?: string;
  };
}

export interface ContactableInbox {
  sourceId: string;
  inbox: Inbox;
}

export interface ContactableInboxesAPIResponse {
  payload: { source_id: string; inbox: object }[];
}

export interface WhatsAppTemplateParams {
  name: string;
  category: string;
  language: string;
  processed_params: Record<string, string>;
}

export interface CreateConversationPayload {
  contactId: number;
  inboxId: number;
  sourceId: string;
  message?: string;
  templateParams?: WhatsAppTemplateParams;
}

export interface WhatsAppTemplateComponent {
  type: string;
  text?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: WhatsAppTemplateComponent[];
}

export interface CreateConversationAPIResponse {
  id: number;
  [key: string]: unknown;
}

export interface ContactLabelsAPIResponse {
  payload: string[];
}

export interface ContactLabelsPayload {
  contactId: number;
}

export interface UpdateContactLabelsPayload {
  contactId: number;
  labels: string[];
}

export interface ContactConversationPayload {
  contactId: number;
}

export interface ContactConversationAPIResponse {
  payload: Conversation[];
}
